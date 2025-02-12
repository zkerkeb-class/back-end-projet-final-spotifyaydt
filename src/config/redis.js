import { createClient } from 'redis';
import logger from './logger.js';

// URL Redis Render
const redisUrl = 'redis://red-cugusshu0jms73frn0v0:6379';

const redisClient = createClient({
    url: redisUrl,
    socket: {
        tls: false, // Désactiver TLS si Render ne l'exige pas
    }
});

redisClient.on("error", (err) => {
    logger.error("Erreur Redis:", err);
});

redisClient.on("connect", () => {
    logger.info("Redis connecté avec succès");
});

// Connexion à Redis
redisClient.connect()
    .then(() => logger.info("Redis connecté avec succès"))
    .catch(err => logger.error("Échec de connexion à Redis:", err));

export default redisClient;
