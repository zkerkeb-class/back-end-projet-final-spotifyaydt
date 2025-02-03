import { createClient } from '@redis/client';
import logger from './logger.js';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379', // Utilise REDIS_URL de Heroku
  socket: {
    tls: true, // Activer le SSL/TLS
    rejectUnauthorized: false, // Accepter les certificats auto-signés
  },
});

redisClient
  .connect()
  .then(() => {
    logger.info(`Connected to Redis at ${process.env.REDIS_URL}`);
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
