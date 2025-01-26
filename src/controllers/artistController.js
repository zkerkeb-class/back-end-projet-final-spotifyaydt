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

    const artists = await Artist.find().populate('albums');
    await redisClient.set(cacheKey, JSON.stringify(artists), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

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

    const artist = await Artist.findById(id).populate('albums');
    if (!artist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }
    await redisClient.set(cacheKey, JSON.stringify(artist), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Créer un nouvel artiste (invalide le cache global des artistes)
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

// Ajoutez une invalidation de cache dans les fonctions de mise à jour et de suppression
export const updateArtist = async (req, res) => {
  try {
    const updatedArtist = await Artist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    ).populate('albums');
    if (!updatedArtist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }
    await invalidateArtistCache(req.params.id); // Invalide le cache
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

    const artists = await Artist.find({ genre }).populate('albums');
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
      .populate('albums');

    await redisClient.set(cacheKey, JSON.stringify(artists), 'EX', 3600);

    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
