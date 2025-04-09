import { metaphone } from 'metaphone';
import levenshtein from 'fast-levenshtein';

// Importer les modèles
import Track from '../models/Track.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Playlist from '../models/Playlist.js';
import logger from '../config/logger.js';

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

    logger.info('Request Parameters:', req.query);

    const models = { Track, Artist, Album, Playlist };
    const Model = models[model];
    if (!Model) {
      logger.info('Invalid model:', model);
      return res.status(400).json({
        error: 'Invalid model specified. Use "Track", "Artist", "Album", or "Playlist".',
      });
    }

    // Création du filtre de base
    const filter = {};

    // 🔍 Filtrage par artiste
    if (artist) {
      const artistDoc = await Artist.findOne({ name: new RegExp(artist, 'i') });
      if (!artistDoc) {
        logger.info('Artist not found:', artist);
        return res.status(404).json({ error: 'Artist not found' });
      }
      if (model === 'Track' || model === 'Album') {
        filter.artist = artistDoc._id;
      }
    }

    // 🎵 Filtrage par album (uniquement pour les Tracks)
    if (album && model === 'Track') {
      const albumDoc = await Album.findOne({ title: new RegExp(album, 'i') });
      if (!albumDoc) {
        logger.info('Album not found:', album);
        return res.status(404).json({ error: 'Album not found' });
      }
      filter.album = albumDoc._id;
    }

    // 🎶 Filtrage par genre
    if (genre) {
      filter.genre = genre;
    }

    // 📅 Filtrage par année
    if (year) {
      filter.year = parseInt(year, 10);
    }

    // ⏱️ Filtrage par durée (uniquement pour les Tracks)
    if (durationMin || durationMax) {
      filter.duration = {};
      if (durationMin) {
        filter.duration.$gte = parseInt(durationMin, 10);
      }
      if (durationMax) {
        filter.duration.$lte = parseInt(durationMax, 10);
      }
    }
    // 🎼 Filtrage par playlist
    if (playlist && model === 'Track') {
      filter.playlist = playlist;
    }

    // 🔎 Recherche par mots-clés
    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      filter.$or = [
        { title: regex },
        { 'artist.name': regex },
        { 'album.title': regex },
        { genre: regex },
      ];
    }

    // 🔊 Recherche phonétique avec Metaphone (optionnelle, pour Track uniquement)
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

    logger.info('Filter:', filter);

    // 📌 Gestion du tri
    const sort = {};
    if (model === 'Track') {
      if (sortBy === 'duration') {
        sort.duration = sortOrder === 'asc' ? 1 : -1;
      }
      if (sortBy === 'popularity') {
        sort.popularity = sortOrder === 'asc' ? 1 : -1;
      }
      if (sortBy === 'title') {
        sort.title = sortOrder === 'asc' ? 1 : -1;
      }
    } else if (model === 'Album') {
      if (sortBy === 'year') {
        sort.year = sortOrder === 'asc' ? 1 : -1;
      }
      if (sortBy === 'popularity') {
        sort.popularity = sortOrder === 'asc' ? 1 : -1;
      }
      if (sortBy === 'trackCount') {
        sort.trackCount = sortOrder === 'asc' ? 1 : -1;
      }
    } else if (model === 'Artist') {
      if (sortBy === 'name') {
        sort.name = sortOrder === 'asc' ? 1 : -1;
      }
    } else if (model === 'Playlist') {
      if (sortBy === 'trackCount') {
        sort.trackCount = sortOrder === 'asc' ? 1 : -1;
      }
    }

    // 📜 Pagination
    const skip = (page - 1) * parseInt(limit, 10);

    // 🔄 Requête principale
    let query = Model.find(filter).skip(skip).limit(parseInt(limit, 10)).sort(sort);

    // 🎤 Ajouter le populate pour Track
    if (model === 'Track') {
      query = query.populate('artist').populate('album');
    }

    // 🔄 Exécution de la requête
    const results = await query;
    logger.info('Query Results:', results);

    // 🏁 Total des résultats
    const totalItems = await Model.countDocuments(filter);

    // 📡 Réponse
    return res.status(200).json({
      data: results,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page, 10),
      },
    });
  } catch (error) {
    logger.info('Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export default {
  getItems,
};
