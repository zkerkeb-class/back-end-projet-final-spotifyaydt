import express from 'express';
import * as trackController from '../controllers/trackController.js';

const router = express.Router();

// Routes de base
router.get('/', trackController.getAllTracks);
router.get('/:id', trackController.getTrackById);
router.post('/', trackController.createTrack);
router.put('/:id', trackController.updateTrack);
router.delete('/:id', trackController.deleteTrack);

// Routes de filtrage et tri dynamiques
router.get('/filter/:filterType/:filterValue', trackController.filterTracks);
router.get('/sort/:sortBy/:order?', trackController.sortTracks);

// Route de recherche
router.get('/search', trackController.searchTracks);

export default router;
