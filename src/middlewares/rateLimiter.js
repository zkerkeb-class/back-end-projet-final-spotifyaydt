import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

const WINDOW_SIZE_IN_SECONDS = 60; // Fenêtre de temps (1 minute)
const MAX_REQUESTS_PER_WINDOW = 10000; // Nombre maximum de requêtes par fenêtre

export const rateLimiter = async (req, res, next) => {
  try {
    // Utiliser l'IP comme identifiant (ou req.user.id si authentifié)
    const identifier = req.ip;
    const key = `ratelimit:${identifier}`;

    // Obtenir le nombre actuel de requêtes
    const currentRequests = await redisClient.get(key);

    if (currentRequests === null) {
      // Première requête, initialiser le compteur
      await redisClient.set(key, 1, 'EX', WINDOW_SIZE_IN_SECONDS);
      next();
    } else {
      const requestCount = parseInt(currentRequests);

      if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
        // Limite atteinte
        logger.warn(`Rate limit dépassé pour ${identifier}`);
        return res.status(429).json({
          message: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: WINDOW_SIZE_IN_SECONDS,
        });
      }

      // Incrémenter le compteur
      await redisClient.incr(key);
      next();
    }
  } catch (error) {
    logger.error('Erreur dans le rate limiter:', error);
    // En cas d'erreur, on laisse passer la requête
    next();
  }
};

// Rate limiter spécifique pour les uploads
export const uploadRateLimiter = async (req, res, next) => {
  try {
    const identifier = req.ip;
    const key = `ratelimit:upload:${identifier}`;
    const UPLOAD_WINDOW = 3600; // 1 heure
    const MAX_UPLOADS = 2000; // 10 uploads par heure

    const currentUploads = await redisClient.get(key);

    if (currentUploads === null) {
      await redisClient.set(key, 1, 'EX', UPLOAD_WINDOW);
      next();
    } else {
      const uploadCount = parseInt(currentUploads);

      if (uploadCount >= MAX_UPLOADS) {
        logger.warn(`Limite d'upload dépassée pour ${identifier}`);
        return res.status(429).json({
          message: 'Limite duploads atteinte. Veuillez réessayer dans une heure.',
          retryAfter: UPLOAD_WINDOW,
        });
      }

      await redisClient.incr(key);
      next();
    }
  } catch (error) {
    logger.error('Erreur dans le rate limiter dupload:', error);
    next();
  }
};

// Rate limiter pour les requêtes API intensives
export const heavyRequestRateLimiter = async (req, res, next) => {
  try {
    const identifier = req.ip;
    const key = `ratelimit:heavy:${identifier}`;
    const HEAVY_WINDOW = 300; // 5 minutes
    const MAX_HEAVY_REQUESTS = 2000; // 20 requêtes lourdes par 5 minutes

    const currentRequests = await redisClient.get(key);

    if (currentRequests === null) {
      await redisClient.set(key, 1, 'EX', HEAVY_WINDOW);
      next();
    } else {
      const requestCount = parseInt(currentRequests);

      if (requestCount >= MAX_HEAVY_REQUESTS) {
        logger.warn(`Limite de requêtes lourdes dépassée pour ${identifier}`);
        return res.status(429).json({
          message: 'Trop de requêtes intensives. Veuillez réessayer dans 5 minutes.',
          retryAfter: HEAVY_WINDOW,
        });
      }

      await redisClient.incr(key);
      next();
    }
  } catch (error) {
    logger.error('Erreur dans le rate limiter des requêtes lourdes:', error);
    next();
  }
};
