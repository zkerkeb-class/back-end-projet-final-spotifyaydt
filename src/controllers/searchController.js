import { metaphone } from 'metaphone';
import levenshtein from 'fast-levenshtein';

// Importer les modèles
import Track from '../models/Track.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Playlist from '../models/Playlist.js';

export const getItems = async (req, res) => {
  try {
    const {
      model,
      keyword,
      genre,
      artist,
      album,
      year,
      durationMin,
      durationMax,
      playlist,
      sortBy = 'popularity',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const models = { Track, Artist, Album, Playlist };
    const Model = models[model];
    if (!Model) {
      return res.status(400).json({
        error: 'Invalid model specified. Use "Track", "Artist", or "Album".',
      });
    }

    // Création du filtre de base
    const filter = {};

    // Filtrage par genre
    if (genre) {
      filter.genre = genre;
    }

    // Filtrage par artiste
    if (artist) {
      filter.artist = artist;
    }

    // Filtrage par album
    if (album) {
      filter.album = album;
    }

    // Filtrage par année
    if (year) {
      filter.year = year;
    }

    // Filtrage par durée
    if (durationMin || durationMax) {
      filter.duration = {};
      if (durationMin) {
        filter.duration.$gte = parseInt(durationMin, 10);
      }
      if (durationMax) {
        filter.duration.$lte = parseInt(durationMax, 10);
      }
    }

    // Filtrage par playlist (si applicable au modèle)
    if (playlist && model === 'Track') {
      filter.playlist = playlist;
    }

    // Recherche par mots-clés (titre, artiste, genre, etc.)
    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      filter.$or = [
        { title: regex },
        { 'artist.name': regex },
        { 'album.title': regex },
        { genre: regex },
      ];
    }

    // Recherche phonétique avec Metaphone (optionnelle, pour Track uniquement)
    if (keyword && model === 'Track') {
      const phoneticKeyword = metaphone(keyword);
      const allTracks = await Track.find({});
      const similarTracks = allTracks.filter((track) => {
        const titlePhonetic = metaphone(track.title || '');
        const distance = levenshtein.get(phoneticKeyword, titlePhonetic);
        return distance <= 2;
      });

      filter._id = { $in: similarTracks.map((t) => t._id) };
    }

    // Pagination
    const skip = (page - 1) * parseInt(limit, 10);

    // Tri
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Requête principale
    let query = Model.find(filter).skip(skip).limit(parseInt(limit, 10)).sort(sort);

    // Ajouter le populate en fonction du modèle
    if (model === 'Track') {
      query = query.populate('artist').populate('album');
    }

    const results = await query;

    // Total des résultats
    const totalItems = await Model.countDocuments(filter);

    // Réponse
    return res.status(200).json({
      data: results,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page, 10),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default {
  getItems,
};
