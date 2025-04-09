import express from 'express';
import {
  createPlaylist,
  getAllPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  getPlaylistsSortedByTrackCount,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  searchPlaylists,
} from '../controllers/playlistController.js';
import { validatePlaylist } from '../validations/playlistValidation.js';
import { rateLimiter, heavyRequestRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Routes CRUD pour les playlists
router.post('/', heavyRequestRateLimiter, validatePlaylist, createPlaylist); // Créer une playlist
router.get('/', rateLimiter, getAllPlaylists); // Récupérer toutes les playlists
router.get('/:id', rateLimiter, getPlaylistById); // Récupérer une playlist par ID
router.put('/:id', heavyRequestRateLimiter, updatePlaylist); // Mettre à jour une playlist
router.delete('/:id', heavyRequestRateLimiter, deletePlaylist); // Supprimer une playlist
router.get('/sort/tracks', getPlaylistsSortedByTrackCount); // Récupérer les playlists triées par nombre de pistes

// Routes de gestion des pistes dans la playlist (limites strictes car potentiellement lourdes)
router.post('/:id/tracks', heavyRequestRateLimiter, addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', heavyRequestRateLimiter, removeTrackFromPlaylist);

// Routes de recherche (requêtes lourdes)
router.get('/search', heavyRequestRateLimiter, searchPlaylists);

export default router;
