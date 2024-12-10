import express from 'express';
import {
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
} from '../controllers/artistController.js';

const router = express.Router();

// Routes CRUD pour les artistes
router.post('/', createArtist); // Créer un artiste
router.get('/', getAllArtists); // Récupérer tous les artistes
router.get('/:id', getArtistById); // Récupérer un artiste par ID
router.put('/:id', updateArtist); // Mettre à jour un artiste
router.delete('/:id', deleteArtist); // Supprimer un artiste

export default router;
