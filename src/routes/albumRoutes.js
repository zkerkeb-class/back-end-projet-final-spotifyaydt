import express from 'express';
import { validateAlbum } from '../validations/albumValidation.js';
import {
  rateLimiter,
  uploadRateLimiter,
  heavyRequestRateLimiter,
} from '../middlewares/rateLimiter.js';
import {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  searchAlbums,
  getAlbumsByArtist,
  getAlbumsByGenre,
} from '../controllers/albumController.js';

const router = express.Router();

// Routes de lecture (limites plus souples)
router.get('/', rateLimiter, getAllAlbums);
router.get('/:id', rateLimiter, getAlbumById);

// Routes de recherche et filtrage (requêtes lourdes)
router.get('/search', heavyRequestRateLimiter, searchAlbums);
router.get('/artist/:artistId', heavyRequestRateLimiter, getAlbumsByArtist);
router.get('/genre/:genre', heavyRequestRateLimiter, getAlbumsByGenre);

// Routes de modification (limites modérées)
router.post('/', uploadRateLimiter, validateAlbum, createAlbum);
router.put('/:id', heavyRequestRateLimiter, validateAlbum, updateAlbum);
router.delete('/:id', heavyRequestRateLimiter, deleteAlbum);

export default router;
