import express from 'express';
import * as albumController from '../controllers/albumController.js';

const router = express.Router();

// Routes de base
router.get('/', albumController.getAllAlbums);
router.get('/:id', albumController.getAlbumById);
router.post('/', albumController.createAlbum);
router.put('/:id', albumController.updateAlbum);
router.delete('/:id', albumController.deleteAlbum);

// Routes de filtrage et tri dynamiques
router.get('/filter/:filterType/:filterValue', albumController.filterAlbums);
router.get('/sort/:sortBy/:order?', albumController.sortAlbums);

// Route de recherche
router.get('/search', albumController.searchAlbums);

export default router;
