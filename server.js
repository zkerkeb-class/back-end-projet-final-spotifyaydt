import express, { json } from 'express';
import { createClient } from '@redis/client';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import connectDB from './src/config/db.js';

const app = express();
app.use(json());

// Configuration du client Redis
const redisClient = createClient({
  host: 'localhost', // L'adresse de votre serveur Redis
  port: 6379, // Le port par défaut de Redis
});

// Connexion Redis
redisClient
  .connect()
  .then(() => {
    console.log('Connecté à Redis');

    // Vérification de la connexion Redis
    redisClient
      .ping()
      .then((response) => {
        console.log('Réponse de Redis:', response); // Cela devrait afficher "PONG"
      })
      .catch((err) => {
        console.error('Erreur avec ping Redis:', err);
      });
  })
  .catch((err) => {
    console.error('Erreur de connexion à Redis:', err);
  });

// Configuration de la session avec Redis
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key', // à remplacer par un secret sécurisé
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 }, // 1 heure
  }),
);

// Connexion à la base de données
connectDB();

// Exemple de route pour tester les sessions
app.get('/session', (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.send(`Vous avez visité cette page ${req.session.views} fois`);
  } else {
    req.session.views = 1;
    res.send('Bienvenue sur cette page !');
  }
});

// Route de test
app.get('/', (req, res) => {
  res.send('Hello, this is the API!');
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
