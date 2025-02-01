import express from 'express';
import {
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  getArtistsByGenre,
  getArtistsSortedByName,
  searchArtists,
} from '../controllers/artistController.js';
import { validateArtist } from '../validations/artistValidation.js';
import {
  rateLimiter,
  uploadRateLimiter,
  heavyRequestRateLimiter,
} from '../middlewares/rateLimiter.js';

const router = express.Router();

// Routes CRUD pour les artistes
router.post('/', uploadRateLimiter, validateArtist, createArtist); // Créer un artiste
router.get('/', rateLimiter, getAllArtists); // Récupérer tous les artistes
router.get('/:id', rateLimiter, getArtistById); // Récupérer un artiste par ID
router.put('/:id', heavyRequestRateLimiter, validateArtist, updateArtist); // Mettre à jour un artiste
router.delete('/:id', heavyRequestRateLimiter, deleteArtist); // Supprimer un artiste
router.get('/genre/:genre', getArtistsByGenre); // Récupérer les artistes par genre
router.get('/sort/name', getArtistsSortedByName); // Récupérer les artistes par ordre alphabétique
router.get('/search', heavyRequestRateLimiter, searchArtists);

export default router;
