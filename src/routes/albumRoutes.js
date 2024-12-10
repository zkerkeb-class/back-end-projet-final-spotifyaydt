import express from 'express';
import {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
} from '../controllers/albumController.js';

const router = express.Router();

// Routes CRUD pour les albums
router.post('/', createAlbum); // Créer un album
router.get('/', getAllAlbums); // Récupérer tous les albums
router.get('/:id', getAlbumById); // Récupérer un album par ID
router.put('/:id', updateAlbum); // Mettre à jour un album
router.delete('/:id', deleteAlbum); // Supprimer un album

export default router;
