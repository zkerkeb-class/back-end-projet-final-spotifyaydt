import { Router } from 'express';
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
import { rateLimiter, heavyOperationLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Routes CRUD pour les playlists
router.post('/', heavyOperationLimiter, validatePlaylist, createPlaylist); // Créer une playlist
router.get('/', rateLimiter, getAllPlaylists); // Récupérer toutes les playlists
router.get('/:id', rateLimiter, getPlaylistById); // Récupérer une playlist par ID
router.put('/:id', heavyOperationLimiter, validatePlaylist, updatePlaylist); // Mettre à jour une playlist
router.delete('/:id', heavyOperationLimiter, deletePlaylist); // Supprimer une playlist
router.get('/sort/tracks', getPlaylistsSortedByTrackCount); // Récupérer les playlists triées par nombre de pistes

// Routes de gestion des pistes dans la playlist (limites strictes car potentiellement lourdes)
router.post('/:id/tracks', heavyOperationLimiter, addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', heavyOperationLimiter, removeTrackFromPlaylist);

// Routes de recherche (requêtes lourdes)
router.get('/search', heavyOperationLimiter, searchPlaylists);

export default router;
