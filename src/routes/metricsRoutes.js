import express from 'express';
import { getSystemMetrics } from '../controllers/metricsController.js';

const router = express.Router();

router.get('/system', getSystemMetrics);

export default router;
