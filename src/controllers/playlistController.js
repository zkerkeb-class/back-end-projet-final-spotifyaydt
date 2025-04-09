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

    const playlists = await Playlist.find().populate({
      path: 'tracks',
      populate: [
        { path: 'artist', select: 'name genre description' },
        { path: 'album', select: 'title genre releaseDate coverImage' },
      ],
    });

    // Transformation des données pour simplifier la structure et éviter les ObjectId
    const playlistsWithDetails = playlists.map((playlist) => ({
      _id: playlist._id,
      name: playlist.name,
      description: playlist.description,
      tracks: playlist.tracks.map((track) => ({
        _id: track._id,
        title: track.title,
        genre: track.genre,
        duration: track.duration,
        audioUrl: track.audioUrl,
        releaseDate: track.releaseDate,
        listens: track.listens,
        artist: {
          _id: track.artist._id,
          name: track.artist.name,
          genre: track.artist.genre,
          description: track.artist.description,
        },
        album: {
          _id: track.album._id,
          title: track.album.title,
          genre: track.album.genre,
          releaseDate: track.album.releaseDate,
          coverImage: track.album.coverImage,
        },
      })),
    }));

    await redisClient.set(cacheKey, JSON.stringify(playlistsWithDetails), 'EX', 3600); // Cache avec expiration de 1h

    res.status(200).json(playlistsWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rechercher des playlists (par exemple, par nom ou genre)
export const searchPlaylists = async (req, res) => {
  try {
    const { query } = req.query; // Récupérer la requête de recherche (ex. ?query=rock)

    if (!query) {
      return res.status(400).json({ message: 'Le paramètre "query" est requis.' });
    }

    // Effectuer la recherche dans les playlists (ex. recherche par nom ou genre)
    const playlists = await Playlist.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Recherche insensible à la casse par nom
        { genre: { $regex: query, $options: 'i' } }, // Recherche insensible à la casse par genre
      ],
    });

    if (playlists.length === 0) {
      return res.status(404).json({ message: 'Aucune playlist trouvée.' });
    }

    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ajouter une piste à une playlist
export const addTrackToPlaylist = async (req, res) => {
  try {
    const { id } = req.params; // ID de la playlist
    const { trackId } = req.body; // ID de la piste à ajouter

    // Trouver la playlist par ID
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist non trouvée' });
    }

    // Ajouter la piste à la playlist
    if (!playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId);
      await playlist.save();
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une piste de la playlist
export const removeTrackFromPlaylist = async (req, res) => {
  try {
    const { id, trackId } = req.params; // ID de la playlist et ID de la piste

    // Trouver la playlist par ID
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist non trouvée' });
    }

    // Vérifier si la piste existe dans la playlist
    const trackIndex = playlist.tracks.indexOf(trackId);
    if (trackIndex === -1) {
      return res.status(404).json({ message: 'Piste non trouvée dans la playlist' });
    }

    // Supprimer la piste de la playlist
    playlist.tracks.splice(trackIndex, 1);
    await playlist.save();

    res.status(200).json(playlist);
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

    const playlist = await Playlist.findById(id).populate({
      path: 'tracks',
      populate: [
        { path: 'artist', select: 'name genre description' },
        { path: 'album', select: 'title genre releaseDate coverImage' },
      ],
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist non trouvée' });
    }

    // Transformation des données pour simplifier la structure et éviter les ObjectId
    const playlistWithDetails = {
      _id: playlist._id,
      name: playlist.name,
      description: playlist.description,
      tracks: playlist.tracks.map((track) => ({
        _id: track._id,
        title: track.title,
        genre: track.genre,
        duration: track.duration,
        audioUrl: track.audioUrl,
        releaseDate: track.releaseDate,
        listens: track.listens,
        artist: {
          _id: track.artist._id,
          name: track.artist.name,
          genre: track.artist.genre,
          description: track.artist.description,
        },
        album: {
          _id: track.album._id,
          title: track.album.title,
          genre: track.album.genre,
          releaseDate: track.album.releaseDate,
          coverImage: track.album.coverImage,
        },
      })),
    };

    await redisClient.set(cacheKey, JSON.stringify(playlistWithDetails), 'EX', 3600); // Cache avec expiration de 1h

    res.status(200).json(playlistWithDetails);
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
    logger.error('Erreur lors de l’invalidation du cache Redis :', error);
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
    const updatedPlaylist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('tracks');
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

// Récupérer les playlists triées par nombre de pistes (du plus grand au plus petit)
export const getPlaylistsSortedByTrackCount = async (req, res) => {
  try {
    const cacheKey = 'playlists:sorted:trackCount';
    const cachedPlaylists = await redisClient.get(cacheKey);

    if (cachedPlaylists) {
      return res.status(200).json(JSON.parse(cachedPlaylists));
    }

    // Récupérer toutes les playlists et les trier par la taille du tableau tracks
    const playlists = await Playlist.aggregate([
      {
        $project: {
          name: 1,
          tracks: 1,
          trackCount: { $size: '$tracks' },
        },
      },
      { $sort: { trackCount: -1 } },
    ]).exec();

    // Populate les tracks après l'agrégation
    await Playlist.populate(playlists, { path: 'tracks' });

    await redisClient.set(cacheKey, JSON.stringify(playlists), 'EX', 3600);

    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
