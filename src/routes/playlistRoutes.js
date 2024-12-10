import express from 'express';
import {
  createPlaylist,
  getAllPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  getPlaylistsSortedByTrackCount,
} from '../controllers/playlistController.js';

const router = express.Router();

// Routes CRUD pour les playlists
router.post('/', createPlaylist); // Créer une playlist
router.get('/', getAllPlaylists); // Récupérer toutes les playlists
router.get('/:id', getPlaylistById); // Récupérer une playlist par ID
router.put('/:id', updatePlaylist); // Mettre à jour une playlist
router.delete('/:id', deletePlaylist); // Supprimer une playlist
router.get('/sort/tracks', getPlaylistsSortedByTrackCount); // Récupérer les playlists triées par nombre de pistes

export default router;
