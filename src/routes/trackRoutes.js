import express from 'express';
import {
  createTrack,
  getAllTracks,
  getTrackById,
  updateTrack,
  deleteTrack,
  getTracksByArtist,
  getTracksByAlbum,
  getTracksByGenre,
  getTracksByYear,
  getTracksByDuration,
  getTracksByPopularity,
  getTracksByPlaylist,
  getTracksSortedByDuration,
  getTracksSortedByListens,
  getTracksSortedByTitle,
} from '../controllers/trackController.js';

const router = express.Router();

// Routes CRUD pour les pistes audio
router.post('/', createTrack);
router.get('/', getAllTracks);
router.get('/:id', getTrackById);
router.put('/:id', updateTrack);
router.delete('/:id', deleteTrack);
router.get('/artist/:artistName', getTracksByArtist); // Récupérer les pistes par nom d'artiste
router.get('/album/:albumTitle', getTracksByAlbum); // Récupérer les pistes par titre d'album
router.get('/playlist/:playlistName', getTracksByPlaylist); // Récupérer les pistes par nom de playlist
router.get('/genre/:genre', getTracksByGenre); // Récupérer les pistes par genre
router.get('/year/:year', getTracksByYear); // Route pour filtrer les pistes par année de sortie
router.get('/duration/:range', getTracksByDuration); // Route pour filtrer les pistes par durée
router.get('/popularity/:range', getTracksByPopularity); // Route pour filtrer les pistes par popularité
router.get('/sort/duration/:order', getTracksSortedByDuration); // Route pour trier les pistes par durée (asc/desc)
router.get('/sort/popular', getTracksSortedByListens); // Route pour trier les pistes par nombre d'écoutes
router.get('/sort/title', getTracksSortedByTitle); // Route pour trier les pistes par ordre alphabétique du titre

export default router;
