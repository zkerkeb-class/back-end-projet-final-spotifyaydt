import si from 'systeminformation';
import Redis from 'ioredis';
import { logger } from '../config/logger.js';

let requestsCount = 0;
let lastRequestTime = Date.now();
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
    const cpuTrend = cpuLoad.currentLoad - cpuLoad.avgLoad;

    // Métriques mémoire
    const mem = await si.mem();
    const memoryUsage = (mem.used / mem.total) * 100;
    const memoryTrend = ((mem.used - mem.available) / mem.total) * 100;

    // Test de latence Redis
    const startRedis = Date.now();
    await redis.ping();
    const redisLatency = Date.now() - startRedis;

    // Calcul du temps de réponse API moyen
    const apiResponseTime = Date.now() - lastRequestTime;

    // Métriques de bande passante
    const networkStats = await si.networkStats();
    const bandwidth = networkStats.reduce((acc, curr) => acc + curr.tx_sec + curr.rx_sec, 0);

    res.json({
      cpuUsage,
      cpuTrend,
      memoryUsage,
      memoryTrend,
      redisLatency,
      redisLatencyTrend: 0,
      apiResponseTime,
      apiResponseTimeTrend: 0,
      bandwidth,
      bandwidthTrend: 0,
      requestsPerSecond: requestsCount,
      requestsTrend: 0,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des métriques système:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des métriques système' });
  }
};
