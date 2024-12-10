import { createClient } from '@redis/client';

const redisClient = createClient({
  url: 'redis://127.0.0.1:6379', // Utilisez l'URL pour spécifier l'adresse et le port
});

redisClient
  .connect()
  .then(() => {
    console.log('Connecté à Redis');
  })
  .catch((err) => {
    console.error('Erreur de connexion à Redis:', err);
  });

export default redisClient;
