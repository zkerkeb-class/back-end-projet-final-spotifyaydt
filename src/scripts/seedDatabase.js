import { disconnect } from 'mongoose';
import connectDB from '../config/db.js';
import { faker } from '@faker-js/faker';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Track from '../models/Track.js';
import Playlist from '../models/Playlist.js';
const logger = require('../config/logger');

// Connexion à MongoDB
connectDB();

// Ajouter des constantes pour la configuration
const SEED_CONFIG = {
  ARTISTS_COUNT: 10,
  ALBUMS_PER_ARTIST: 3,
  TRACKS_PER_ALBUM: 5,
  PLAYLISTS_COUNT: 5,
};

// Fonction pour générer un artiste
async function createFakeArtist() {
  const artist = new Artist({
    name: faker.person.fullName(),
    genre: faker.music.genre(),
    description: faker.lorem.paragraph(),
    popularity: faker.number.int({ min: 0, max: 100 }),
  });

  await artist.save();
  return artist;
}

// Fonction pour générer un album
async function createFakeAlbum(artist) {
  const album = new Album({
    title: faker.music.album(),
    artist: artist._id,
    genre: artist.genre, // Genre aligné avec l'artiste
    releaseDate: faker.date.past(5),
    coverImage: faker.image.url(),
  });

  await album.save();

  // Ajouter cet album à l'artiste
  artist.albums.push(album._id);
  await artist.save();

  return album;
}

// Fonction pour générer une piste audio
async function createFakeTrack(album, artist) {
  const track = new Track({
    title: faker.music.songName(),
    artist: artist._id,
    album: album._id,
    genre: album.genre, // Genre aligné avec l'album
    duration: faker.number.int({ min: 120, max: 300 }), // durée en secondes
    filePath: faker.internet.url(),
    listens: faker.number.int({ min: 0, max: 1000 }),
    releaseDate: faker.date.between(album.releaseDate, new Date()),
  });

  await track.save();

  // Ajouter cette piste à l'album
  album.tracks.push(track._id);
  await album.save();

  return track;
}

// Fonction pour générer une playlist
async function createFakePlaylist(tracks) {
  const playlist = new Playlist({
    name: faker.music.playlistName(),
    tracks: faker.helpers.arrayElements(
      tracks.map((t) => t._id),
      10,
    ), // Sélectionne 10 pistes au hasard
  });

  await playlist.save();
  return playlist;
}

// Fonction principale pour générer les données factices
async function seedDatabase() {
  logger.info('🔄 Démarrage du peuplement de la base de données...');

  // Nettoyer les collections existantes
  await Artist.deleteMany({});
  await Album.deleteMany({});
  await Track.deleteMany({});
  await Playlist.deleteMany({});

  const allTracks = [];
  const artists = [];

  // Générer des artistes et leurs albums
  for (let i = 0; i < SEED_CONFIG.ARTISTS_COUNT; i++) {
    const artist = await createFakeArtist();
    artists.push(artist);

    // Pour chaque artiste, créer quelques albums
    for (let j = 0; j < SEED_CONFIG.ALBUMS_PER_ARTIST; j++) {
      const album = await createFakeAlbum(artist);

      // Pour chaque album, créer quelques pistes audio
      for (let k = 0; k < SEED_CONFIG.TRACKS_PER_ALBUM; k++) {
        const track = await createFakeTrack(album, artist);
        allTracks.push(track);
      }
    }
  }

  // Générer des playlists avec les pistes créées
  for (let i = 0; i < SEED_CONFIG.PLAYLISTS_COUNT; i++) {
    await createFakePlaylist(allTracks);
  }

  logger.info('✅ Base de données peuplée avec succès.');
  disconnect();
}

// Lancer le processus de seeding
seedDatabase().catch((err) => {
  logger.error('❌ Erreur lors du peuplement de la base de données :', err);
  disconnect();
});

// Améliorer la gestion des erreurs
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error);
  process.exit(1);
});
