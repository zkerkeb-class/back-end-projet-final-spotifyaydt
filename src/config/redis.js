import { createClient } from '@redis/client';
import logger from './logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({
  url: redisUrl,
  socket: {
    tls: true, // Utilisation du protocole SSL/TLS pour la connexion sécurisée
    rejectUnauthorized: false, // Désactive la vérification des certificats auto-signés, mais à changer pour la prod
  },
});

redisClient
  .connect()
  .then(() => {
    logger.info('Connected to Redis');
  })
  .catch((err) => {
    logger.error('Redis connection error:', err);
    process.exit(1); // Arrêt du serveur en cas d'erreur de connexion Redis
  });

// Écoute des événements
redisClient.on('connect', () => {
  logger.info('Redis connecté avec succès');
});

redisClient.on('error', (err) => {
  logger.error('Erreur Redis:', err);
});

export default redisClient;
