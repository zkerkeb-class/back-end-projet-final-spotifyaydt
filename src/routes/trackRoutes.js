import express from 'express';
import { validateTrack } from '../validations/trackValidation.js';
import { uploadAudio, handleMulterError } from '../middlewares/uploadMiddleware.js';
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

// Routes publiques
router.get('/', getAllTracks);
router.get('/search', searchTracks);
router.get('/filter/:filterType/:filterValue', filterTracks);
router.get('/sort/:sortBy/:order?', sortTracks);
router.get('/:id', getTrackById);

// Routes protégées nécessitant une authentification
router.post('/', uploadAudio, handleMulterError, validateTrack, createTrack);
router.put('/:id', validateTrack, updateTrack);
router.delete('/:id', deleteTrack);

export default router;
