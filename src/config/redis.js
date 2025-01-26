import { createClient } from '@redis/client';
import logger from './logger';

const redisClient = createClient({
  url: 'redis://127.0.0.1:6379', // Utilisez l'URL pour spécifier l'adresse et le port
});

redisClient
  .connect()
  .then(() => {
    logger.info('Connecté à Redis');
  })
  .catch((err) => {
    logger.info('Erreur de connexion à Redis:', err);
  });

export default redisClient;
