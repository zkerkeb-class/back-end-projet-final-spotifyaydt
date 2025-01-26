import redisClient from '../config/redis.js';
import Track from '../models/Track.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Playlist from '../models/Playlist.js';

// Récupérer toutes les pistes audio avec cache
export const getAllTracks = async (req, res) => {
  try {
    const cacheKey = 'tracks:all';
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks)); // Retourne les données du cache
    }

    const tracks = await Track.find().populate('artist album');
    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600); // Cache avec expiration de 1h

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une piste audio par ID avec cache
export const getTrackById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `track:${id}`;
    const cachedTrack = await redisClient.get(cacheKey);

    if (cachedTrack) {
      return res.status(200).json(JSON.parse(cachedTrack)); // Retourne les données du cache
    }

    const track = await Track.findById(id).populate('artist album');
    if (!track) {
      return res.status(404).json({ message: 'Piste audio non trouvée' });
    }
    await redisClient.set(cacheKey, JSON.stringify(track), 'EX', 3600); // Cache avec expiration de 1h

    res.status(200).json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer le cache correspondant après modification
const invalidateTrackCache = async (id = null) => {
  try {
    if (id) {
      await redisClient.del(`track:${id}`);
    }
    await redisClient.del('tracks:all');
  } catch (error) {
    logger.error('Erreur lors de l’invalidation du cache Redis :', error);
  }
};

// Créer une nouvelle piste audio
export const createTrack = async (req, res) => {
  try {
    const track = new Track(req.body);
    const savedTrack = await track.save();
    await invalidateTrackCache(); // Invalide le cache global des pistes
    res.status(201).json(savedTrack);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour une piste audio
export const updateTrack = async (req, res) => {
  try {
    const updatedTrack = await Track.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    ).populate('artist album');
    if (!updatedTrack) {
      return res.status(404).json({ message: 'Piste audio non trouvée' });
    }
    await invalidateTrackCache(req.params.id); // Invalide le cache de cette piste et le cache global
    res.status(200).json(updatedTrack);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une piste audio
export const deleteTrack = async (req, res) => {
  try {
    const deletedTrack = await Track.findByIdAndDelete(req.params.id);
    if (!deletedTrack) {
      return res.status(404).json({ message: 'Piste audio non trouvée' });
    }
    await invalidateTrackCache(req.params.id); // Invalide le cache de cette piste et le cache global
    res.status(200).json({ message: 'Piste audio supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les pistes par artiste
export const getTracksByArtist = async (req, res) => {
  try {
    const { artistName } = req.params;
    const cacheKey = `tracks:artist:${artistName}`;
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks));
    }

    // Trouver d'abord l'artiste par son nom
    const artist = await Artist.findOne({ name: artistName });
    if (!artist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }

    const tracks = await Track.find({ artist: artist._id }).populate(
      'artist album',
    );
    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600);

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les pistes par album
export const getTracksByAlbum = async (req, res) => {
  try {
    const { albumTitle } = req.params;
    const cacheKey = `tracks:album:${albumTitle}`;
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks));
    }

    // Trouver d'abord l'album par son titre
    const album = await Album.findOne({ title: albumTitle });
    if (!album) {
      return res.status(404).json({ message: 'Album non trouvé' });
    }

    const tracks = await Track.find({ album: album._id }).populate(
      'artist album',
    );
    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600);

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les pistes par genre
export const getTracksByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const cacheKey = `tracks:genre:${genre}`;
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks)); // Retourne les données du cache
    }

    const tracks = await Track.find({ genre }).populate('artist album');
    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les pistes par année de sortie
export const getTracksByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const cacheKey = `tracks:year:${year}`;
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks)); // Retourne les données du cache
    }

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const tracks = await Track.find({
      releaseDate: { $gte: startDate, $lte: endDate },
    }).populate('artist album');
    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les pistes par durée
export const getTracksByDuration = async (req, res) => {
  try {
    const { range } = req.params;
    let minDuration, maxDuration;

    switch (range) {
      case 'short':
        minDuration = 0;
        maxDuration = 180; // 3 minutes
        break;
      case 'medium':
        minDuration = 181;
        maxDuration = 300; // 5 minutes
        break;
      case 'long':
        minDuration = 301;
        maxDuration = Number.MAX_SAFE_INTEGER;
        break;
      default:
        return res.status(400).json({ message: 'Invalid duration range' });
    }

    const cacheKey = `tracks:duration:${range}`;
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks)); // Retourne les données du cache
    }

    const tracks = await Track.find({
      duration: { $gte: minDuration, $lte: maxDuration },
    }).populate('artist album');
    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les pistes par popularité
export const getTracksByPopularity = async (req, res) => {
  try {
    const { range } = req.params;
    let minListens, maxListens;

    switch (range) {
      case 'low':
        minListens = 0;
        maxListens = 100; // 3 minutes
        break;
      case 'medium':
        minListens = 101;
        maxListens = 1000; // 5 minutes
        break;
      case 'high':
        minListens = 1001;
        maxListens = Number.MAX_SAFE_INTEGER;
        break;
      default:
        return res.status(400).json({ message: 'Invalid popularity range' });
    }

    const cacheKey = `tracks:listens:${range}`;
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks)); // Retourne les données du cache
    }

    const tracks = await Track.find({
      listens: { $gte: minListens, $lte: maxListens },
    }).populate('artist album');
    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les pistes par playlist
export const getTracksByPlaylist = async (req, res) => {
  try {
    const { playlistName } = req.params;
    const cacheKey = `tracks:playlist:${playlistName}`;
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks));
    }

    // Trouver d'abord la playlist par son nom
    const playlist = await Playlist.findOne({ name: playlistName }).populate({
      path: 'tracks',
      populate: {
        path: 'artist album',
      },
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist non trouvée' });
    }

    const tracks = playlist.tracks;
    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600);

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les pistes triées par durée
export const getTracksSortedByDuration = async (req, res) => {
  try {
    const { order = 'asc' } = req.params; // 'asc' pour croissant, 'desc' pour décroissant
    const cacheKey = `tracks:sorted:duration:${order}`;
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks));
    }

    // Définir l'ordre de tri (1 pour croissant, -1 pour décroissant)
    const sortOrder = order === 'desc' ? -1 : 1;

    const tracks = await Track.find()
      .sort({ duration: sortOrder })
      .populate('artist album');

    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600);

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les pistes triées par nombre d'écoutes (du plus écouté au moins écouté)
export const getTracksSortedByListens = async (req, res) => {
  try {
    const cacheKey = 'tracks:sorted:listens';
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks));
    }

    const tracks = await Track.find()
      .sort({ listens: -1 }) // -1 pour trier du plus écouté au moins écouté
      .populate('artist album');

    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600);

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les pistes triées par ordre alphabétique du titre
export const getTracksSortedByTitle = async (req, res) => {
  try {
    const cacheKey = 'tracks:sorted:title';
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks));
    }

    const tracks = await Track.find()
      .sort({ title: 1 }) // 1 pour trier par ordre alphabétique
      .populate('artist album');

    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600);

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
