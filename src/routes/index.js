import express from 'express';
import albumRoutes from './albumRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import artistRoutes from './artistRoutes.js';
import trackRoutes from './trackRoutes.js';

const router = express.Router();

router.use('/albums', albumRoutes);
router.use('/playlists', playlistRoutes);
router.use('/artists', artistRoutes);
router.use('/tracks', trackRoutes);

export default router;
