import fs from 'fs';
import path from 'path';
import logger from '../config/logger.js';
import * as musicMetadata from 'music-metadata';
import { faker } from '@faker-js/faker';
import { connectToDb } from '../config/db.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Track from '../models/Track.js';

// Connexion à MongoDB
connectToDb()
  .then(logger.info('🔄 Connexion à la base de données établie avec succès.'))
  .catch((err) => {
    logger.error('❌ Erreur de connexion à la base de données :', err);
  });

const AUDIO_DIRECTORY = './public/audio_files';

const extractMetadata = async (filePath) => {
  try {
    const metadata = await musicMetadata.parseFile(filePath);
    const title = metadata.common.title || faker.lorem.words(3);

    // Traitement des artistes (gestion des virgules)
    const artists = metadata.common.artist
      ? metadata.common.artist.split(',').map((artist) => artist.trim())
      : [faker.person.fullName()]; // Remplacement par un nom d'artiste généré

    const duration =
      Math.round(metadata.format.duration) || faker.number.int({ min: 120, max: 300 }); // Durée générée si absente

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
      genre: faker.music.genre(), // Utilisation de Faker pour un genre musical
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
  // Créer ou récupérer les artistes associés à l'album
  const artistesId = await Promise.all(
    artistes.map(async (artisteName) => {
      const artiste = await createArtiste(artisteName);
      return artiste._id;
    })
  );

  // Si tu as un champ `artist` unique dans Album (et non `artistes`)
  let album = await Album.findOne({
    title: albumTitle,
    artist: artistesId[0], // Associer un seul artiste (ici le premier de la liste)
  });

  if (!album) {
    album = await Album.create({
      title: albumTitle,
      releaseDate: faker.date.past(30).getFullYear(),
      artist: artistesId[0], // Associer un seul artiste (pas un tableau)
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

  // Sélectionner le premier artiste dans la liste (par exemple)
  const artist = await Artist.findOne({ name: artistes[0] });
  if (!artist) {
    throw new Error(`Aucun artiste trouvé pour ${artistes[0]}`);
  }

  let audio = await Track.findOne({ filePath: audioData.filePath });
  if (!audio) {
    // Ajout d'une vérification pour l'artiste et l'album
    if (!albumId) {
      throw new Error(`Aucun album trouvé pour le fichier ${audioData.filePath}`);
    }

    audio = await Track.create({
      title: audioData.title,
      artist: artist._id, // Utilisation de l'ID de l'artiste trouvé
      album: albumId, // ID de l'album
      genre: faker.music.genre(),
      duration: audioData.duration,
      filePath: audioData.filePath,
      listens: faker.number.int({ min: 0, max: 1000 }),
      releaseDate: new Date(), // Date actuelle
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

    // 1. Créer ou récupérer l'album avec les artistes
    const albumTitle = faker.lorem.words(2);
    const album = await createAlbum(albumTitle, artists);

    // 2. Créer ou récupérer l'Audio et l'associer à l'album
    await createAudio({ title, duration, filePath }, album._id, artists);

    logger.info(`Fichier audio traité : ${title} - Artistes : ${artists.join(', ')}`);
  } catch (error) {
    logger.error(`Erreur lors du traitement du fichier ${filePath}: ${error.message}`);
  }
};

// Fonction principale pour parcourir les fichiers audio
const processAudioFiles = async () => {
  try {
    const files = fs.readdirSync(AUDIO_DIRECTORY);

    // Parcours de chaque fichier dans le répertoire
    for (const file of files) {
      const filePath = path.join(AUDIO_DIRECTORY, file);

      // Vérification si c'est un fichier audio
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
