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
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createArtistSchema,
  updateArtistSchema,
} from '../validations/artistValidation.js';

const router = express.Router();

// Routes CRUD pour les artistes
router.post('/', validateRequest(createArtistSchema), createArtist); // Créer un artiste
router.get('/', getAllArtists); // Récupérer tous les artistes
router.get('/:id', getArtistById); // Récupérer un artiste par ID
router.put('/:id', validateRequest(updateArtistSchema), updateArtist); // Mettre à jour un artiste
router.delete('/:id', deleteArtist); // Supprimer un artiste
router.get('/genre/:genre', getArtistsByGenre); // Récupérer les artistes par genre
router.get('/sort/name', getArtistsSortedByName); // Récupérer les artistes par ordre alphabétique

export default router;
