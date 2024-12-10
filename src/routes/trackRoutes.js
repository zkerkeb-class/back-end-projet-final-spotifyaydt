import express from 'express';
import {
  createTrack,
  getAllTracks,
  getTrackById,
  updateTrack,
  deleteTrack,
} from '../controllers/trackController.js';

const router = express.Router();

// Routes CRUD pour les pistes audio
router.post('/', createTrack);
router.get('/', getAllTracks);
router.get('/:id', getTrackById);
router.put('/:id', updateTrack);
router.delete('/:id', deleteTrack);

export default router;
