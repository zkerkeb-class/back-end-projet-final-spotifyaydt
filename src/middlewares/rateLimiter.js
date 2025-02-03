import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 10000;

export const rateLimiter = async (req, res, next) => {
  try {
    const identifier = req.ip;
    const key = `ratelimit:${identifier}`;
    const currentRequests = await redisClient.get(key);

    if (currentRequests === null) {
      await redisClient.set(key, 1, 'EX', WINDOW_SIZE_IN_SECONDS);
      next();
    } else {
      const requestCount = parseInt(currentRequests);
      if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
        logger.warn(`Rate limit dépassé pour ${identifier}`);
        return res.status(429).json({
          message: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: WINDOW_SIZE_IN_SECONDS,
        });
      }
      await redisClient.incr(key);
      next();
    }
  } catch (error) {
    logger.error('Erreur dans le rate limiter:', error);
    next();
  }
};

// Rate limiter pour les opérations lourdes (30 requêtes par minute)
export const heavyOperationLimiter = async (req, res, next) => {
  try {
    const identifier = req.ip;
    const key = `ratelimit:heavy:${identifier}`;
    const currentRequests = await redisClient.get(key);

    if (currentRequests === null) {
      await redisClient.set(key, 1, 'EX', 60);
      next();
    } else {
      const requestCount = parseInt(currentRequests);
      if (requestCount >= 1030) {
        logger.warn(`Rate limit dépassé pour ${identifier}`);
        return res.status(429).json({
          message: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: 60,
        });
      }
      await redisClient.incr(key);
      next();
    }
  } catch (error) {
    logger.error('Erreur dans le rate limiter:', error);
    next();
  }
};

// Rate limiter pour les uploads (20 requêtes par minute)
export const uploadRateLimiter = async (req, res, next) => {
  try {
    const identifier = req.ip;
    const key = `ratelimit:upload:${identifier}`;
    const currentRequests = await redisClient.get(key);

    if (currentRequests === null) {
      await redisClient.set(key, 1, 'EX', 60);
      next();
    } else {
      const requestCount = parseInt(currentRequests);
      if (requestCount >= 2000) {
        logger.warn(`Rate limit dépassé pour ${identifier}`);
        return res.status(429).json({
          message: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: 60,
        });
      }
      await redisClient.incr(key);
      next();
    }
  } catch (error) {
    logger.error('Erreur dans le rate limiter:', error);
    next();
  }
};
