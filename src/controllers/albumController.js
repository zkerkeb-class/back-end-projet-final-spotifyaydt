import redisClient from '../config/redis.js';
import Album from '../models/Album.js';
import Artist from '../models/Artist.js';

// Récupérer tous les albums avec cache
export const getAllAlbums = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un album par ID avec cache
export const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `album:${id}`;
    const cachedAlbum = await redisClient.get(cacheKey);

    if (cachedAlbum) {
      return res.status(200).json(JSON.parse(cachedAlbum)); // Retourne les données du cache
    }

    const album = await Album.findById(id).populate('artist tracks');
    if (!album) {
      return res.status(404).json({ message: 'Album non trouvé' });
    }

    await redisClient.set(cacheKey, JSON.stringify(album), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(album);
  } catch (error) {
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
export const createAlbum = async (req, res) => {
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
export const updateAlbum = async (req, res) => {
  try {
    const updatedAlbum = await Album.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    ).populate('artist tracks');
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
export const deleteAlbum = async (req, res) => {
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

// Récupérer les albums par artiste
export const getAlbumsByArtist = async (req, res) => {
  try {
    const { artistName } = req.params;
    const cacheKey = `albums:artist:${artistName}`;
    const cachedAlbums = await redisClient.get(cacheKey);

    if (cachedAlbums) {
      return res.status(200).json(JSON.parse(cachedAlbums));
    }

    // Trouver d'abord l'artiste par son nom
    const artist = await Artist.findOne({ name: artistName });
    if (!artist) {
      return res.status(404).json({ message: 'Artiste non trouvé' });
    }

    const albums = await Album.find({ artist: artist._id }).populate(
      'artist tracks',
    );
    await redisClient.set(cacheKey, JSON.stringify(albums), 'EX', 3600);

    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les albums par genre
export const getAlbumsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const cacheKey = `albums:genre:${genre}`;
    const cachedAlbums = await redisClient.get(cacheKey);

    if (cachedAlbums) {
      return res.status(200).json(JSON.parse(cachedAlbums)); // Retourne les données du cache
    }

    const albums = await Album.find({ genre }).populate('artist tracks');
    await redisClient.set(cacheKey, JSON.stringify(albums), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les albums par année de sortie
export const getAlbumsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const cacheKey = `albums:year:${year}`;
    const cachedAlbums = await redisClient.get(cacheKey);

    if (cachedAlbums) {
      return res.status(200).json(JSON.parse(cachedAlbums)); // Retourne les données du cache
    }

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const albums = await Album.find({
      releaseDate: { $gte: startDate, $lte: endDate },
    }).populate('artist tracks');
    await redisClient.set(cacheKey, JSON.stringify(albums), 'EX', 3600); // Stocke dans Redis avec expiration de 1h

    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les albums triés par date de sortie (du plus récent au plus ancien)
export const getAlbumsSortedByReleaseDate = async (req, res) => {
  try {
    const cacheKey = 'albums:sorted:releaseDate';
    const cachedAlbums = await redisClient.get(cacheKey);

    if (cachedAlbums) {
      return res.status(200).json(JSON.parse(cachedAlbums));
    }

    const albums = await Album.find()
      .sort({ releaseDate: -1 }) // -1 pour trier du plus récent au plus ancien
      .populate('artist tracks');

    await redisClient.set(cacheKey, JSON.stringify(albums), 'EX', 3600);

    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les albums triés par nombre de pistes (du plus grand au plus petit)
export const getAlbumsSortedByTrackCount = async (req, res) => {
  try {
    const cacheKey = 'albums:sorted:trackCount';
    const cachedAlbums = await redisClient.get(cacheKey);

    if (cachedAlbums) {
      return res.status(200).json(JSON.parse(cachedAlbums));
    }

    // Utiliser l'agrégation pour compter le nombre de pistes et trier
    const albums = await Album.aggregate([
      {
        $project: {
          title: 1,
          artist: 1,
          genre: 1,
          releaseDate: 1,
          coverImage: 1,
          tracks: 1,
          trackCount: { $size: '$tracks' },
        },
      },
      { $sort: { trackCount: -1 } },
    ]).exec();

    // Populate les références après l'agrégation
    await Album.populate(albums, [{ path: 'artist' }, { path: 'tracks' }]);

    await redisClient.set(cacheKey, JSON.stringify(albums), 'EX', 3600);

    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
