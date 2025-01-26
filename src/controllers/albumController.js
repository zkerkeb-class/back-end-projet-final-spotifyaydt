import redisClient from '../config/redis.js';
import logger from '../config/logger.js';
import Album from '../models/Album.js';

// Récupérer tous les albums avec cache
const getAllAlbums = async (req, res) => {
  try {
    const cacheKey = 'albums:all';
    const cachedAlbums = await redisClient.get(cacheKey);

    if (cachedAlbums) {
      return res.status(200).json(JSON.parse(cachedAlbums)); // Retourne les données du cache
    }

    const albums = await Album.find().populate('artist tracks');
    await redisClient.set(cacheKey, JSON.stringify(albums), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(albums);
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un album par ID avec cache
const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `album:${id}`;
    const cachedAlbum = await redisClient.get(cacheKey);

    if (cachedAlbum) {
      return res.status(200).json(JSON.parse(cachedAlbum)); // Retourne les données du cache
    }

    const result = await Album.findById(id).populate('artist').populate('tracks');
    if (!result) {
      return res.status(404).json({ message: 'Album non trouvé' });
    }

    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Supprimer le cache correspondant après une modification
const invalidateAlbumCache = async (id = null) => {
  try {
    if (id) {
      await redisClient.del(`album:${id}`);
    }
    await redisClient.del('albums:all');
  } catch (error) {
    logger.error('Erreur lors de l’invalidation du cache Redis :', error);
  }
};

// Créer un nouvel album (invalide le cache global des albums)
const createAlbum = async (req, res) => {
  try {
    const album = new Album(req.body);
    const savedAlbum = await album.save();
    await invalidateAlbumCache(); // Invalide le cache global des albums
    res.status(201).json(savedAlbum);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un album
const updateAlbum = async (req, res) => {
  try {
    const updatedAlbum = await Album.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('artist tracks');
    if (!updatedAlbum) {
      return res.status(404).json({ message: 'Album non trouvé' });
    }

    await invalidateAlbumCache(req.params.id); // Invalide le cache de cet album et le cache global
    res.status(200).json(updatedAlbum);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un album
const deleteAlbum = async (req, res) => {
  try {
    const deletedAlbum = await Album.findByIdAndDelete(req.params.id);
    if (!deletedAlbum) {
      return res.status(404).json({ message: 'Album non trouvé' });
    }

    await invalidateAlbumCache(req.params.id); // Invalide le cache de cet album et le cache global
    res.status(200).json({ message: 'Album supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAllAlbums, getAlbumById, createAlbum, updateAlbum, deleteAlbum };
