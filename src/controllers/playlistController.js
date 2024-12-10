import redisClient from '../config/redis.js';
import Playlist from '../models/Playlist.js';

// Récupérer toutes les playlists avec cache
export const getAllPlaylists = async (req, res) => {
  try {
    const cacheKey = 'playlists:all';
    const cachedPlaylists = await redisClient.get(cacheKey);

    if (cachedPlaylists) {
      return res.status(200).json(JSON.parse(cachedPlaylists)); // Retourne les données du cache
    }

    const playlists = await Playlist.find().populate('tracks');
    await redisClient.set(cacheKey, JSON.stringify(playlists), 'EX', 3600); // Cache avec expiration de 1h

    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une playlist par ID avec cache
export const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `playlist:${id}`;
    const cachedPlaylist = await redisClient.get(cacheKey);

    if (cachedPlaylist) {
      return res.status(200).json(JSON.parse(cachedPlaylist)); // Retourne les données du cache
    }

    const playlist = await Playlist.findById(id).populate('tracks');
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist non trouvée' });
    }
    await redisClient.set(cacheKey, JSON.stringify(playlist), 'EX', 3600); // Cache avec expiration de 1h

    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer le cache correspondant après modification
const invalidatePlaylistCache = async (id = null) => {
  try {
    if (id) {
      await redisClient.del(`playlist:${id}`);
    }
    await redisClient.del('playlists:all');
  } catch (error) {
    console.error('Erreur lors de l’invalidation du cache Redis :', error);
  }
};

// Créer une nouvelle playlist
export const createPlaylist = async (req, res) => {
  try {
    const playlist = new Playlist(req.body);
    const savedPlaylist = await playlist.save();
    await invalidatePlaylistCache(); // Invalide le cache global des playlists
    res.status(201).json(savedPlaylist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour une playlist
export const updatePlaylist = async (req, res) => {
  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    ).populate('tracks');
    if (!updatedPlaylist) {
      return res.status(404).json({ message: 'Playlist non trouvée' });
    }
    await invalidatePlaylistCache(req.params.id); // Invalide le cache de cette playlist et le cache global
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une playlist
export const deletePlaylist = async (req, res) => {
  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(req.params.id);
    if (!deletedPlaylist) {
      return res.status(404).json({ message: 'Playlist non trouvée' });
    }
    await invalidatePlaylistCache(req.params.id); // Invalide le cache de cette playlist et le cache global
    res.status(200).json({ message: 'Playlist supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
