import express from 'express';
import { validateTrack } from '../validations/trackValidation.js';
import { uploadAudio, handleMulterError } from '../middlewares/uploadMiddleware.js';
import {
  rateLimiter,
  uploadRateLimiter,
  heavyRequestRateLimiter,
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

const router = express.Router();

// Routes de lecture (limites plus souples)
router.get('/', rateLimiter, getAllTracks);
router.get('/:id', rateLimiter, getTrackById);

// Routes de recherche et filtrage (requêtes lourdes - limites strictes)
router.get('/search', heavyRequestRateLimiter, searchTracks);
router.get('/filter/:filterType/:filterValue', heavyRequestRateLimiter, filterTracks);
router.get('/sort/:sortBy/:order?', heavyRequestRateLimiter, sortTracks);

// Routes de modification (limites modérées)
router.post('/', uploadRateLimiter, uploadAudio, handleMulterError, validateTrack, createTrack);
router.put('/:id', heavyRequestRateLimiter, validateTrack, updateTrack);
router.delete('/:id', heavyRequestRateLimiter, deleteTrack);

export default router;
