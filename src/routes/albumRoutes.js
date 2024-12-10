import express from 'express';
import {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  getAlbumsByArtist,
  getAlbumsByGenre,
  getAlbumsByYear,
  getAlbumsSortedByReleaseDate,
  getAlbumsSortedByTrackCount,
} from '../controllers/albumController.js';

const router = express.Router();

// Routes CRUD pour les albums
router.post('/', createAlbum); // Créer un album
router.get('/', getAllAlbums); // Récupérer tous les albums
router.get('/:id', getAlbumById); // Récupérer un album par ID
router.put('/:id', updateAlbum); // Mettre à jour un album
router.delete('/:id', deleteAlbum); // Supprimer un album
router.get('/artist/:artistName', getAlbumsByArtist); // Récupérer les albums par nom d'artiste
router.get('/genre/:genre', getAlbumsByGenre); // Route pour filtrer les albums par genre
router.get('/year/:year', getAlbumsByYear); // Route pour filtrer les albums par année de sortie
router.get('/sort/date', getAlbumsSortedByReleaseDate); // Route pour obtenir les albums du plus récent au plus ancien
router.get('/sort/tracks', getAlbumsSortedByTrackCount); // Route pour trier les albums par nombre de pistes

export default router;
