import { createClient } from '@redis/client';
import logger from './logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({
  url: redisUrl,
  socket: {
    tls: true, // Utilisation du protocole SSL/TLS pour la connexion sécurisée
    rejectUnauthorized: false, // Désactive la vérification des certificats auto-signés
  },
});

redisClient
  .connect()
  .then(() => {
    logger.info('Connected to Redis');
  })
  .catch((err) => {
    logger.error('Redis connection error:', err);
  });

redisClient.on('connect', () => {
  logger.info('Redis connecté avec succès');
});

redisClient.on('error', (err) => {
  logger.error('Erreur Redis:', err);
});

export default redisClient;
