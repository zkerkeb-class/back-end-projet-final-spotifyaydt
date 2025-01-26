import express from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import albumController from '../controllers/albumController.js';
import { createAlbumSchema, updateAlbumSchema } from '../validations/albumValidation.js';

const router = express.Router();

// Routes de base
router.get('/', albumController.getAllAlbums);
router.get('/:id', albumController.getAlbumById);
router.post('/', validateRequest(createAlbumSchema), albumController.createAlbum);
router.put('/:id', validateRequest(updateAlbumSchema), albumController.updateAlbum);
router.delete('/:id', albumController.deleteAlbum);

export default router;
