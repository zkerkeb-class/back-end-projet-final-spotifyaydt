import { createClient } from '@redis/client';
const logger = require('./logger');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});

redisClient
  .connect()
  .then(() => {
    logger.info('Connected to Redis');
  })
  .catch((err) => {
    logger.error('Redis connection error:', err);
  });

export default redisClient;
