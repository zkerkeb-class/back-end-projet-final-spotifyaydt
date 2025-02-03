import si from 'systeminformation';
import Redis from 'ioredis';
import logger from '../config/logger.js';

let requestsCount = 0;
let lastRequestTime = Date.now();
let previousRequestCount = 0;
let previousCpuUsage = 0;
let previousMemoryUsage = 0;
let previousRedisLatency = 0;

const redis = new Redis();

// Réinitialise le compteur de requêtes chaque seconde
setInterval(() => {
  requestsCount = 0;
  lastRequestTime = Date.now();
}, 1000);

export const getSystemMetrics = async (req, res) => {
  try {
    // Incrémente le compteur de requêtes
    requestsCount++;

    // Récupère les métriques CPU
    const cpuLoad = await si.currentLoad();
    const cpuUsage = cpuLoad.currentLoad;
    const cpuTrend = cpuUsage - previousCpuUsage; // Calcul de la tendance CPU

    // Métriques mémoire
    const mem = await si.mem();
    const memoryUsage = (mem.used / mem.total) * 100;
    const memoryTrend = memoryUsage - previousMemoryUsage; // Calcul de la tendance mémoire

    // Test de latence Redis
    const startRedis = Date.now();
    await redis.ping();
    const redisLatency = Date.now() - startRedis;
    const redisLatencyTrend = redisLatency - previousRedisLatency; // Calcul de la tendance de la latence Redis

    // Calcul du temps de réponse API moyen
    const apiResponseTime = Date.now() - lastRequestTime;
    const apiResponseTimeTrend = apiResponseTime - (lastRequestTime - previousRequestCount); // Tendance du temps de réponse API

    // Métriques de bande passante
    const networkStats = await si.networkStats();
    const bandwidth = networkStats.reduce((acc, curr) => acc + curr.tx_sec + curr.rx_sec, 0);

    // Mise à jour des anciennes valeurs pour le prochain cycle
    previousCpuUsage = cpuUsage;
    previousMemoryUsage = memoryUsage;
    previousRedisLatency = redisLatency;
    previousRequestCount = Date.now();

    res.json({
      cpuUsage,
      cpuTrend,
      memoryUsage,
      memoryTrend,
      redisLatency,
      redisLatencyTrend,
      apiResponseTime,
      apiResponseTimeTrend,
      bandwidth,
      requestsPerSecond: requestsCount,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des métriques système:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des métriques système' });
  }
};
