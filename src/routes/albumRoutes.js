import express from 'express';
import { validateAlbum } from '../validations/albumValidation.js';
import {
  rateLimiter,
  uploadRateLimiter,
  heavyOperationLimiter,
} from '../middlewares/rateLimiter.js';
import albumController from '../controllers/albumController.js';

const router = express.Router();

// Routes de lecture (limites plus souples)
router.get('/', rateLimiter, albumController.getAllAlbums);
router.get('/:id', rateLimiter, albumController.getAlbumById);

// Routes de recherche et filtrage (requêtes lourdes)

// Routes de modification (limites modérées)
router.post('/', uploadRateLimiter, validateAlbum, albumController.createAlbum);
router.put('/:id', heavyOperationLimiter, validateAlbum, albumController.updateAlbum);
router.delete('/:id', heavyOperationLimiter, albumController.deleteAlbum);

export default router;
