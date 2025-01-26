import redisClient from '../config/redis.js';
const Track = require('../models/Track');

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
    const updatedTrack = await Track.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('artist album');
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

export const searchTracks = async (req, res) => {
  const { title, artistName, albumTitle, genre } = req.query;

  // Construction dynamique de la requête
  const query = {};
  if (title) {
    query.title = { $regex: title, $options: 'i' };
  }

  if (genre) {
    query.genre = { $regex: genre, $options: 'i' };
  }

  try {
    // Recherche avec population et filtrage sur les noms
    const tracks = await Track.find(query)
      .populate({
        path: 'artist',
        match: artistName ? { name: { $regex: artistName, $options: 'i' } } : {},
        select: 'name',
      })
      .populate({
        path: 'album',
        match: albumTitle ? { title: { $regex: albumTitle, $options: 'i' } } : {}, // Recherche sur le titre de l'album
        select: 'title', // On limite les champs renvoyés
      });

    // Filtrer les résultats si un artiste ou un album ne correspond pas
    const filteredTracks = tracks.filter((track) => track.artist && track.album);

    res.status(200).json(filteredTracks);
  } catch (error) {
    logger.error('Erreur lors de la recherche :', error);
    res.status(500).json({ error: 'Erreur lors de la recherche des pistes' });
  }
};

// Définition des configurations de filtrage
const filterConfigurations = {
  genre: {
    type: 'exact',
    field: 'genre',
  },
  year: {
    type: 'date',
    field: 'releaseDate',
    transform: (year) => ({
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    }),
  },
  duration: {
    type: 'range',
    field: 'duration',
    ranges: {
      short: [0, 180],
      medium: [181, 300],
      long: [301, Number.MAX_SAFE_INTEGER],
    },
  },
  popularity: {
    type: 'range',
    field: 'listens',
    ranges: {
      low: [0, 100],
      medium: [101, 1000],
      high: [1001, Number.MAX_SAFE_INTEGER],
    },
  },
};

// Fonction de filtrage dynamique
export const filterTracks = async (req, res) => {
  try {
    const { filterType, filterValue } = req.params;

    // Vérifier si le type de filtre existe
    if (!filterConfigurations[filterType]) {
      return res.status(400).json({ message: 'Type de filtre invalide' });
    }

    const cacheKey = `tracks:${filterType}:${filterValue}`;
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks));
    }

    const config = filterConfigurations[filterType];
    let query = {};

    switch (config.type) {
      case 'exact':
        query[config.field] = filterValue;
        break;

      case 'date':
        query[config.field] = config.transform(filterValue);
        break;

      case 'range':
        if (!config.ranges[filterValue]) {
          return res.status(400).json({ message: 'Valeur de filtre invalide' });
        }
        const [min, max] = config.ranges[filterValue];
        query[config.field] = { $gte: min, $lte: max };
        break;
    }

    const tracks = await Track.find(query).populate('artist album');
    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600);

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction de tri dynamique
export const sortTracks = async (req, res) => {
  try {
    const { sortBy, order = 'asc' } = req.params;
    const validSortFields = ['duration', 'listens', 'title'];

    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ message: 'Champ de tri invalide' });
    }

    const cacheKey = `tracks:sorted:${sortBy}:${order}`;
    const cachedTracks = await redisClient.get(cacheKey);

    if (cachedTracks) {
      return res.status(200).json(JSON.parse(cachedTracks));
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortQuery = { [sortBy]: sortOrder };

    const tracks = await Track.find().sort(sortQuery).populate('artist album');

    await redisClient.set(cacheKey, JSON.stringify(tracks), 'EX', 3600);

    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
