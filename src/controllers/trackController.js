import redisClient from '../config/redis.js';
import Track from '../models/Track.js';
import { s3Client, S3_CONFIG, generateS3Key } from '../config/s3.js';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as mm from 'music-metadata';
import { faker } from '@faker-js/faker/locale/fr';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import { convertToWAV, getAudioDuration } from '../services/audioService.js';
import logger from '../config/logger.js';

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

// Fonction utilitaire pour extraire les métadonnées
const extractMetadata = async (buffer) => {
  try {
    const metadata = await mm.parseBuffer(buffer);
    return {
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      genre: metadata.common.genre?.[0],
      duration: Math.round(metadata.format.duration || 0),
      releaseDate: metadata.common.year ? new Date(metadata.common.year, 0) : null,
    };
  } catch (error) {
    logger.error('Erreur lors de lextraction des métadonnées:', { error: error.message });
    return null;
  }
};

// Fonction pour créer ou récupérer un artiste
const getOrCreateArtist = async (artistName) => {
  let artist = await Artist.findOne({ name: artistName });

  if (!artist) {
    artist = await Artist.create({
      name: artistName,
      genre: faker.music.genre(),
      description: faker.lorem.paragraph(),
      popularity: faker.number.int({ min: 0, max: 100 }),
    });
  }

  return artist;
};

// Fonction pour créer ou récupérer un album
const getOrCreateAlbum = async (albumTitle, artistId) => {
  let album = await Album.findOne({ title: albumTitle, artist: artistId });

  if (!album) {
    album = await Album.create({
      title: albumTitle,
      artist: artistId,
      genre: faker.music.genre(),
      releaseDate: faker.date.past(),
      coverImage: faker.image.urlLoremFlickr({ category: 'album' }),
    });
  }

  return album;
};

// Créer une nouvelle piste audio
export const createTrack = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      logger.warn('Tentative de création de piste sans fichier audio', {
        method: req.method,
        path: req.path,
      });
      return res.status(400).json({ message: 'Le fichier audio est requis' });
    }

    // Vérifier le type MIME
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/m4a',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      logger.warn('Format de fichier non supporté', { mimetype: file.mimetype });
      return res.status(400).json({
        message: 'Format de fichier non supporté. Utilisez MP3, WAV, OGG, AAC ou M4A.',
      });
    }

    try {
      // Convertir l'audio en WAV
      logger.info('Début de la conversion audio en M4A...');
      const convertedAudio = await convertToWAV(file.buffer);
      logger.info('Conversion audio terminée avec succès');

      // Extraire les métadonnées du fichier original
      const metadata = await extractMetadata(file.buffer);
      logger.info('Métadonnées extraites:', { metadata });

      // Générer ou utiliser les données
      const trackData = {
        title: metadata?.title || faker.music.songName(),
        genre: metadata?.genre || faker.music.genre(),
        duration: metadata?.duration || (await getAudioDuration(convertedAudio.buffer)),
        releaseDate: metadata?.releaseDate || faker.date.past(),
      };

      // Gérer l'artiste
      const artistName = metadata?.artist || faker.person.fullName();
      const artist = await getOrCreateArtist(artistName);
      trackData.artist = artist._id;

      // Gérer l'album
      const albumTitle = metadata?.album || `${faker.music.songName()} (Album)`;
      const album = await getOrCreateAlbum(albumTitle, artist._id);
      trackData.album = album._id;

      // Générer une clé unique pour S3 avec l'extension .wav
      const originalFileName = file.originalname.replace(/\.[^/.]+$/, '');
      const s3Key = generateS3Key('tracks', `${originalFileName}.${convertedAudio.extension}`);

      // Configurer le upload vers S3 avec les bons headers pour le streaming
      const uploadParams = {
        Bucket: S3_CONFIG.bucketName,
        Key: s3Key,
        Body: convertedAudio.buffer,
        ContentType: convertedAudio.contentType,
        CacheControl: 'public, max-age=31536000', // Cache d'un an
        ACL: 'public-read',
      };

      // Upload le fichier vers S3
      logger.info('Début de lupload vers S3...');
      await s3Client.send(new PutObjectCommand(uploadParams));
      logger.info('Upload vers S3 terminé avec succès');

      // Générer l'URL CloudFront
      const cloudfrontDomain = process.env.CLOUDFRONT_URL.replace(/\/+$/, '');
      const cloudfrontUrl = `${cloudfrontDomain}/${s3Key.replace(/^\/+/, '')}`;

      // Ajouter les URLs
      trackData.audioUrl = cloudfrontUrl;
      trackData.s3Key = s3Key;

      // Créer et sauvegarder la piste
      const track = new Track(trackData);
      const savedTrack = await track.save();

      // Mettre à jour l'album avec la nouvelle piste
      await Album.findByIdAndUpdate(album._id, {
        $addToSet: { tracks: savedTrack._id },
      });

      await invalidateTrackCache();

      // Récupérer la piste avec les relations peuplées
      const populatedTrack = await Track.findById(savedTrack._id)
        .populate('artist')
        .populate('album');

      res.status(201).json(populatedTrack);
    } catch (conversionError) {
      logger.error('Erreur lors de la conversion audio:', { error: conversionError.message });
      return res.status(400).json({
        message:
          'Erreur lors de la conversion du fichier audio. Vérifiez que le fichier nest pas corrompu.',
        error: conversionError.message,
      });
    }
  } catch (error) {
    logger.error('Erreur lors de la création de la piste:', { error: error.message });
    res.status(500).json({
      message: 'Une erreur est survenue lors de la création de la piste',
      error: error.message,
    });
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
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: 'Piste audio non trouvée' });
    }

    // Supprimer le fichier de S3 si une clé S3 existe
    if (track.s3Key) {
      const deleteParams = {
        Bucket: S3_CONFIG.bucketName,
        Key: track.s3Key,
      };
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    }

    await Track.findByIdAndDelete(req.params.id);
    await invalidateTrackCache(req.params.id);

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
