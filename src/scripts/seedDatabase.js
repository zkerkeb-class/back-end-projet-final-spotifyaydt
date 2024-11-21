// src/scripts/seedDatabase.js
const mongoose = require('mongoose');
const faker = require('@faker-js/faker').faker;
const Artist = require('../models/Artist');
const Album = require('../models/Album').default;
const Track = require('../models/Track').default;

// Connexion à MongoDB
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connecté à MongoDB'))
  .catch((err) => console.log('Erreur de connexion à MongoDB:', err));

// Fonction pour générer un artiste
async function createFakeArtist() {
  const artist = new Artist({
    name: faker.name.findName(),
    genre: faker.music.genre(),
    description: faker.lorem.paragraph(),
    popularity: faker.datatype.number({ min: 0, max: 100 }),
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
    coverImage: faker.image.imageUrl(),
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
    duration: faker.datatype.number({ min: 120, max: 300 }), // durée en secondes
    filePath: faker.internet.url(),
    listens: faker.datatype.number({ min: 0, max: 1000 }),
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
  mongoose.disconnect();
}

// Lancer le processus de seeding
seedDatabase();
