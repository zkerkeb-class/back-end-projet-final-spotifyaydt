// src/scripts/seedDatabase.js
import { disconnect } from 'mongoose';
import connectDB from '../config/db.js';
import { faker } from '@faker-js/faker';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Track from '../models/Track.js';

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
    genre: faker.music.genre(),
    releaseDate: faker.date.past(5),
    coverImage: faker.image.url(),
  });

  await album.save();
  return album;
}

// Fonction pour générer une piste audio
async function createFakeTrack(album, artist) {
  const track = new Track({
    title: faker.music.songName(),
    artist: artist._id,
    album: album._id,
    genre: faker.music.genre(),
    duration: faker.number.int({ min: 120, max: 300 }), // durée en secondes
    filePath: faker.internet.url(),
    listens: faker.number.int({ min: 0, max: 1000 }),
  });

  await track.save();
  return track;
}

// Fonction principale pour générer les données factices
async function seedDatabase() {
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
        await createFakeTrack(album, artist);
      }
    }
  }

  console.log('Base de données peuplée avec des données factices.');
  disconnect();
}

// Lancer le processus de seeding
seedDatabase();
