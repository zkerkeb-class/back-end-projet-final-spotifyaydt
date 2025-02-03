import express, { json } from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import connectDB from './src/config/db.js';
import routes from './src/routes/index.js';
import redisClient from './src/config/redis.js';
import setupSwagger from './src/config/swagger.js';
import logger from './src/config/logger.js';
import metricsRoutes from './src/routes/metricsRoutes.js';
import dotenv from 'dotenv';
import fs from 'fs/promises'; // fs.promises pour les appels non-bloquants
import path from 'path'; // pour gérer les chemins

dotenv.config({ path: './env.dev' });

const app = express();

// Configuration CORS
app.use(
  cors({
    origin: 'http://localhost:3000', // Vérifie que cette URL est bien autorisée en développement
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Autorise les cookies
  })
);

app.use(json());

// Configuration des sessions avec Redis
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET, // Vérifie que cette variable est bien définie
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Sécurise les cookies en prod
      httpOnly: true,
      maxAge: 3600000, // Durée de vie du cookie (1 heure)
    },
  })
);

// Connexion à la base de données
connectDB();

// Routes API
app.use('/api', routes);

// Swagger
setupSwagger(app);

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

app.use('/api/metrics', metricsRoutes);

// Nettoyage des fichiers temporaires
const cleanDirectory = async (dirPath) => {
  const files = await fs.readdir(dirPath); // Utilisation de readdir avec Promises
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = await fs.stat(filePath); // Utilisation de stat avec Promises

    if (stat.isDirectory()) {
      await cleanDirectory(filePath); // Appel récursif avec await
      await fs.rmdir(filePath); // Suppression du dossier vide
    } else {
      const fileAge = Date.now() - stat.mtimeMs;
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      if (fileAge > sevenDaysInMs) {
        await fs.unlink(filePath); // Suppression du fichier si plus vieux que 7 jours
      }
    }
  }
};

// Endpoint pour nettoyer les fichiers temporaires
app.get('/clean-temp', (req, res) => {
  const tempDirs = [
    '/tmp',
    '/var/tmp',
    path.join(__dirname, '.cache'), // Ajuster si tu utilises des chemins spécifiques
  ];

  try {
    tempDirs.forEach(cleanDirectory); // Nettoyage des répertoires
    res.status(200).send('Nettoyage des fichiers temporaires terminé !');
  } catch (error) {
    logger.error('Erreur pendant le nettoyage : ', error);
    res.status(500).send('Une erreur est survenue lors du nettoyage.');
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
