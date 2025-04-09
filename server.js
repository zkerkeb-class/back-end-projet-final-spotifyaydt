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
import setupJamSockets from './src/websockets/jamSockets.js';
import http from 'http';
dotenv.config({ path: './env.dev' });
const app = express();

// Création du serveur HTTP
const server = http.createServer(app);

// Configuration des sockets
setupJamSockets(server);

// Configuration CORS - à ajouter avant les autres middlewares
app.use(
  cors({
     origin: ['http://localhost:3000', 'https://spotifyaydt.netlify.app','https://spotify-aydt.vercel.app'], // URL de votre application React
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Nécessaire si vous utilisez des sessions/cookies
  })
);

app.use(json());

// Configuration de la session avec Redis
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 },
  })
);

// Connexion à la base de données
connectDB();

// Utilisation des routes
app.use('/api', routes);

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

// Fonction pour nettoyer un répertoire
const cleanDirectory = (dirPath) => {
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      cleanDirectory(filePath); // Si c'est un dossier, appeler récursivement
      fs.rmdirSync(filePath); // Supprimer le dossier vide
    } else {
      const fileAge = Date.now() - stat.mtimeMs;
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      if (fileAge > sevenDaysInMs) {
        fs.unlinkSync(filePath); // Supprimer le fichier si il est plus vieux que 7 jours
      }
    }
  });
};

// Endpoint pour nettoyer les fichiers temporaires
app.get('/clean-temp', (req, res) => {
  const tempDirs = [
    '/tmp', // Dossier temporaire système
    '/var/tmp', // Autre dossier temporaire système
    path.join(__dirname, '.cache'), // Cache spécifique à ton app (par exemple pour Node.js ou autres)
  ];

  try {
    tempDirs.forEach(cleanDirectory);
    res.status(200).send('Nettoyage des fichiers temporaires terminé !');
  } catch (error) {
    logger.error('Erreur pendant le nettoyage : ', error);
    res.status(500).send('Une erreur est survenue lors du nettoyage.');
  }
});
// Démarrer le serveur
const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   logger.info(`Server running on port ${PORT}`);
// });
const JAM_PORT = process.env.JAM_PORT || 3002;
server.listen(PORT, () => {
  logger.info('🎶 Jam server running on port 3002');
});
