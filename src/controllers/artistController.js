import logger from '../config/logger.js';
import redisClient from '../config/redis.js';
import Artist from '../models/Artist.js';

// Récupérer tous les artistes avec cache
export const getAllArtists = async (req, res) => {
  try {
    const cacheKey = 'artists:all';
    const cachedArtists = await redisClient.get(cacheKey);

    if (cachedArtists) {
      return res.status(200).json(JSON.parse(cachedArtists)); // Retourne les données du cache
    }

    // On récupère tous les artistes et on peuple les albums et tracks
    const artists = await Artist.find().populate({
      path: 'albums',
      populate: {
        path: 'tracks',
        model: 'Track',
        populate: {
          path: 'artist',
          model: 'Artist',
        },
      },
    });

    // Mettre en cache les artistes avec albums et tracks peuplés
    await redisClient.set(cacheKey, JSON.stringify(artists), 'EX', 3600); // Cache avec expiration de 1h

    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un artiste par ID avec cache
export const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `artist:${id}`;
    const cachedArtist = await redisClient.get(cacheKey);

    if (cachedArtist) {
      return res.status(200).json(JSON.parse(cachedArtist)); // Retourne les données du cache
    }

    const artist = await Artist.findById(id).populate({
      path: 'albums',
      populate: {
        path: 'tracks',
        model: 'Track',
        populate: {
          path: 'artist',
          model: 'Artist',
        },
      },
    });

    if (!artist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }

    // Mettre en cache l'artiste avec albums et tracks
    await redisClient.set(cacheKey, JSON.stringify(artist), 'EX', 3600); // Cache avec expiration de 1h

    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouvel artiste (invalide le cache global des artistes)
export const createArtist = async (req, res) => {
  try {
    const artist = new Artist(req.body);
    const savedArtist = await artist.save();
    await redisClient.del('artists:all'); // Invalide le cache global des artistes
    res.status(201).json(savedArtist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer le cache correspondant après une modification
const invalidateArtistCache = async (id = null) => {
  try {
    if (id) {
      await redisClient.del(`artist:${id}`);
    }
    await redisClient.del('artists:all');
  } catch (error) {
    logger.error('Erreur lors de l’invalidation du cache Redis :', error);
  }
};

// Ajouter une invalidation de cache dans les fonctions de mise à jour et de suppression
export const updateArtist = async (req, res) => {
  try {
    const updatedArtist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: 'albums',
      populate: {
        path: 'tracks',
        model: 'Track',
        populate: {
          path: 'artist',
          model: 'Artist',
        },
      },
    });

    if (!updatedArtist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }

    // Invalider le cache
    await redisClient.del('artists:all');
    await redisClient.del(`artist:${req.params.id}`);

    res.status(200).json(updatedArtist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteArtist = async (req, res) => {
  try {
    const deletedArtist = await Artist.findByIdAndDelete(req.params.id);
    if (!deletedArtist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }
    await invalidateArtistCache(req.params.id); // Invalide le cache
    res.status(200).json({ message: 'Artiste supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les artistes par genre
export const getArtistsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const cacheKey = `artists:genre:${genre}`;
    const cachedArtists = await redisClient.get(cacheKey);

    if (cachedArtists) {
      return res.status(200).json(JSON.parse(cachedArtists)); // Retourne les données du cache
    }

    const artists = await Artist.find({ genre }).populate({
      path: 'albums',
      populate: {
        path: 'tracks',
        model: 'Track',
        populate: {
          path: 'artist', // Peupler l'artiste dans chaque track
          model: 'Artist', // Assurer que ce sont des objets Artist
        },
      },
    });

    await redisClient.set(cacheKey, JSON.stringify(artists), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les artistes triés par ordre alphabétique
export const getArtistsSortedByName = async (req, res) => {
  try {
    const cacheKey = 'artists:sorted:name';
    const cachedArtists = await redisClient.get(cacheKey);

    if (cachedArtists) {
      return res.status(200).json(JSON.parse(cachedArtists));
    }

    const artists = await Artist.find()
      .sort({ name: 1 }) // 1 pour trier par ordre alphabétique
      .populate({
        path: 'albums',
        populate: {
          path: 'tracks',
          model: 'Track',
          populate: {
            path: 'artist', // Peupler l'artiste dans chaque track
            model: 'Artist', // Assurer que ce sont des objets Artist
          },
        },
      });

    await redisClient.set(cacheKey, JSON.stringify(artists), 'EX', 3600);

    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
