import { disconnect } from 'mongoose';
import connectDB from '../config/db.js';
import { faker } from '@faker-js/faker';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Track from '../models/Track.js';
import Playlist from '../models/Playlist.js';

// Connexion à MongoDB
connectDB();

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
      10
    ), // Sélectionne 10 pistes au hasard
  });

  await playlist.save();
  return playlist;
}

// Fonction principale pour générer les données factices
async function seedDatabase() {
  console.log('🔄 Démarrage du peuplement de la base de données...');

  // Nettoyer les collections existantes
  await Artist.deleteMany({});
  await Album.deleteMany({});
  await Track.deleteMany({});
  await Playlist.deleteMany({});

  const allTracks = [];
  const artists = [];

  // Générer des artistes et leurs albums
  for (let i = 0; i < 10; i++) {
    const artist = await createFakeArtist();
    artists.push(artist);

    // Pour chaque artiste, créer quelques albums
    for (let j = 0; j < 3; j++) {
      const album = await createFakeAlbum(artist);

      // Pour chaque album, créer quelques pistes audio
      for (let k = 0; k < 5; k++) {
        const track = await createFakeTrack(album, artist);
        allTracks.push(track);
      }
    }
  }

  // Générer des playlists avec les pistes créées
  for (let i = 0; i < 5; i++) {
    await createFakePlaylist(allTracks);
  }

  console.log('✅ Base de données peuplée avec succès.');
  disconnect();
}

// Lancer le processus de seeding
seedDatabase().catch((err) => {
  console.error('❌ Erreur lors du peuplement de la base de données :', err);
  disconnect();
});
