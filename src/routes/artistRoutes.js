import express from 'express';
import {
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  getArtistsByGenre,
  getArtistsSortedByName,
} from '../controllers/artistController.js';
import { validateArtist } from '../validations/artistValidation.js';
import {
  rateLimiter,
  uploadRateLimiter,
  heavyOperationLimiter,
} from '../middlewares/rateLimiter.js';

const router = express.Router();

// Routes spécifiques d'abord
router.get('/genre/:genre', getArtistsByGenre);
router.get('/sort/name', getArtistsSortedByName);

// Routes CRUD ensuite
router.get('/', rateLimiter, getAllArtists);
router.post('/', uploadRateLimiter, validateArtist, createArtist);
router.get('/:id', rateLimiter, getArtistById);
router.put('/:id', heavyOperationLimiter, validateArtist, updateArtist);
router.delete('/:id', heavyOperationLimiter, deleteArtist);

export default router;
