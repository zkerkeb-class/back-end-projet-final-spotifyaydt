import redisClient from '../config/redis.js';
import Track from '../models/Track.js';

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
    console.error('Erreur lors de l’invalidation du cache Redis :', error);
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
