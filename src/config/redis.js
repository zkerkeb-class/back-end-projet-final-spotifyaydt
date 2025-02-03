import { createClient } from 'redis';
import logger from './logger.js';

// URL Redis Azure
const redisUrl = 'redis://spotifyAYDT.redis.cache.windows.net:6380';
const redisPassword = 'yt7OWDARF1JKPvLObpXIj7GOvXZputGNbAzCaEtUOSs=';

const redisClient = createClient({
    url: redisUrl,
    password: redisPassword,
    socket: {
        tls: true, // Sécuriser la connexion via TLS
        rejectUnauthorized: false, // Accepter des certificats non autorisés (important pour certains services cloud)
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
