import fs from 'fs';
import path from 'path';
import logger from '../config/logger.js';
import * as musicMetadata from 'music-metadata';
import { faker } from '@faker-js/faker';
import connectToDb from '../config/db.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Track from '../models/Track.js';
import { s3Client, S3_CONFIG, generateS3Key } from '../config/s3.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { convertToM4A } from '../services/audioService.js';

// Connexion à MongoDB
connectToDb()
  .then(logger.info('🔄 Connexion à la base de données établie avec succès.'))
  .catch((err) => {
    logger.error('❌ Erreur de connexion à la base de données :', err);
  });

const AUDIO_DIRECTORY = './public/audio_files';

const uploadToS3 = async (filePath, fileName) => {
  try {
    // Lire le fichier
    const fileBuffer = fs.readFileSync(filePath);

    // Convertir en M4A
    logger.info(`Conversion de ${fileName} en M4A...`);
    const convertedAudio = await convertToM4A(fileBuffer);
    logger.info(`Conversion de ${fileName} terminée`);

    // Générer une clé S3 unique
    const s3Key = generateS3Key('tracks', `${fileName}.m4a`);

    // Configurer l'upload
    const uploadParams = {
      Bucket: S3_CONFIG.bucketName,
      Key: s3Key,
      Body: convertedAudio.buffer,
      ContentType: 'audio/mp4',
      CacheControl: 'public, max-age=31536000',
    };

    // Upload vers S3
    logger.info(`Upload de ${fileName} vers S3...`);
    await s3Client.send(new PutObjectCommand(uploadParams));
    logger.info(`Upload de ${fileName} terminé`);

    // Générer l'URL CloudFront
    const cloudfrontDomain = process.env.CLOUDFRONT_URL.replace(/\/+$/, '');
    const cloudfrontUrl = `${cloudfrontDomain}/${s3Key.replace(/^\/+/, '')}`;

    return {
      audioUrl: cloudfrontUrl,
      s3Key: s3Key,
    };
  } catch (error) {
    logger.error(`Erreur lors de l'upload vers S3 pour ${fileName}:`, error);
    throw error;
  }
};

const extractMetadata = async (filePath) => {
  try {
    const metadata = await musicMetadata.parseFile(filePath);
    const title = metadata.common.title || path.basename(filePath, path.extname(filePath));

    // Traitement des artistes (gestion des virgules)
    const artists = metadata.common.artist
      ? metadata.common.artist.split(',').map((artist) => artist.trim())
      : [faker.person.fullName()];

    const duration =
      Math.round(metadata.format.duration) || faker.number.int({ min: 120, max: 300 });

    return { title, artists, duration };
  } catch (error) {
    logger.error(`Erreur d'extraction des métadonnées pour ${filePath}: ${error.message}`);
    return null;
  }
};

// Fonction pour générer un artiste
const createArtiste = async (artisteName) => {
  let artiste = await Artist.findOne({ name: artisteName });
  if (!artiste) {
    artiste = await Artist.create({
      name: artisteName,
      genre: faker.music.genre(),
      description: faker.lorem.paragraph(),
      popularity: faker.number.int({ min: 0, max: 100 }),
    });
    logger.info(`Artiste créé : ${artisteName}`);
  } else {
    logger.info(`Artiste trouvé : ${artisteName}`);
  }
  return artiste;
};

const createAlbum = async (albumTitle, artistes) => {
  const artistesId = await Promise.all(
    artistes.map(async (artisteName) => {
      const artiste = await createArtiste(artisteName);
      return artiste._id;
    })
  );

  let album = await Album.findOne({
    title: albumTitle,
    artist: artistesId[0],
  });

  if (!album) {
    album = await Album.create({
      title: albumTitle,
      releaseDate: faker.date.past(30).getFullYear(),
      artist: artistesId[0],
      genre: faker.music.genre(),
      coverImage: 'https://source.unsplash.com/random/800x600',
    });
    logger.info(`Album créé : ${albumTitle}`);
  } else {
    logger.info(`Album trouvé : ${albumTitle}`);
  }

  return album;
};

const createAudio = async (audioData, albumId, artistes) => {
  if (!artistes || artistes.length === 0) {
    throw new Error('Au moins un artiste doit être spécifié.');
  }

  const artist = await Artist.findOne({ name: artistes[0] });
  if (!artist) {
    throw new Error(`Aucun artiste trouvé pour ${artistes[0]}`);
  }

  let audio = await Track.findOne({ s3Key: audioData.s3Key });
  if (!audio) {
    if (!albumId) {
      throw new Error(`Aucun album trouvé pour le fichier ${audioData.filePath}`);
    }

    audio = await Track.create({
      title: audioData.title,
      artist: artist._id,
      album: albumId,
      genre: faker.music.genre(),
      duration: audioData.duration,
      audioUrl: audioData.audioUrl,
      s3Key: audioData.s3Key,
      listens: faker.number.int({ min: 0, max: 1000 }),
      releaseDate: new Date(),
    });
    logger.info(`Audio créé : ${audioData.title}`);
  } else {
    logger.info(`Audio trouvé : ${audioData.title}`);
  }
  return audio;
};

// Fonction pour traiter un fichier audio
const processAudioFile = async (filePath) => {
  try {
    // Extraire les métadonnées du fichier
    const metadata = await extractMetadata(filePath);
    if (!metadata) {
      return;
    }

    const { title, artists, duration } = metadata;

    // Upload vers S3
    const fileName = path.basename(filePath, path.extname(filePath));
    const s3Data = await uploadToS3(filePath, fileName);

    // Créer ou récupérer l'album avec les artistes
    const albumTitle = faker.lorem.words(2);
    const album = await createAlbum(albumTitle, artists);

    // Créer ou récupérer l'Audio et l'associer à l'album
    await createAudio(
      {
        title,
        duration,
        audioUrl: s3Data.audioUrl,
        s3Key: s3Data.s3Key,
      },
      album._id,
      artists
    );

    logger.info(`Fichier audio traité : ${title} - Artistes : ${artists.join(', ')}`);
  } catch (error) {
    logger.error(`Erreur lors du traitement du fichier ${filePath}: ${error.message}`);
  }
};

// Fonction principale pour parcourir les fichiers audio
const processAudioFiles = async () => {
  try {
    const files = fs.readdirSync(AUDIO_DIRECTORY);

    for (const file of files) {
      const filePath = path.join(AUDIO_DIRECTORY, file);

      if (filePath.endsWith('.mp3') || filePath.endsWith('.wav') || filePath.endsWith('.flac')) {
        await processAudioFile(filePath);
      } else {
        logger.warn(`Fichier ignoré (non audio) : ${filePath}`);
      }
    }

    logger.info('Traitement des fichiers audio terminé.');
  } catch (error) {
    logger.error('Erreur lors du parcours des fichiers audio:', error.message);
  } finally {
    logger.info('🔌 Déconnexion de la base de données.');
    process.exit(0);
  }
};

// Lancer le processus de traitement
processAudioFiles();
