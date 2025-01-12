import { createClient } from '@redis/client';
import { logger } from './logger.js';

const redisClient = createClient({
  url: 'redis://127.0.0.1:6379', // Utilisez l'URL pour spécifier l'adresse et le port
});

redisClient
  .connect()
  .then(() => {
    logger.info('Redis connecté avec succès');
  })
  .catch((err) => {
    logger.error('Erreur Redis:', err);
  });

redisClient.on('connect', () => {
  logger.info('Redis connecté avec succès');
});

redisClient.on('error', (err) => {
  logger.error('Erreur Redis:', err);
});

export default redisClient;
