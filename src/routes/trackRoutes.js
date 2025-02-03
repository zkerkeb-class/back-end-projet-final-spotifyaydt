import { Router } from 'express';
import { validateTrack } from '../validations/trackValidation.js';
import { uploadAudio, handleMulterError } from '../middlewares/uploadMiddleware.js';
import {
  rateLimiter,
  uploadRateLimiter,
  heavyOperationLimiter,
} from '../middlewares/rateLimiter.js';
import {
  getAllTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  searchTracks,
  filterTracks,
  sortTracks,
} from '../controllers/trackController.js';

const router = Router();

// Middleware de log - déplacé en haut
const logRequest = (req, res, next) => {
  console.log('Route /tracks POST hit');
  console.log('Request headers:', req.headers);
  next();
};

// Routes de lecture (limites standards)
router.get('/', rateLimiter, getAllTracks);
router.get('/:id', rateLimiter, getTrackById);

// Routes de recherche et filtrage (requêtes lourdes - limites strictes)
router.get('/search', heavyOperationLimiter, searchTracks);
router.get('/filter/:filterType/:filterValue', heavyOperationLimiter, filterTracks);
router.get('/sort/:sortBy/:order?', heavyOperationLimiter, sortTracks);

// Routes de modification (limites plus strictes)
router.post(
  '/',
  logRequest,
  uploadRateLimiter,
  uploadAudio,
  handleMulterError,
  validateTrack,
  createTrack
);
router.put('/:id', heavyOperationLimiter, validateTrack, updateTrack);
router.delete('/:id', heavyOperationLimiter, deleteTrack);

export default router;
