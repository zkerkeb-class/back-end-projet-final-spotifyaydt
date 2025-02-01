import express from 'express';
import albumRoutes from './albumRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import artistRoutes from './artistRoutes.js';
import trackRoutes from './trackRoutes.js';
import searchRoutes from './searchRoutes.js';
import imageRoutes from './imageRoutes.js';

const router = express.Router();

router.use('/albums', albumRoutes);
router.use('/playlists', playlistRoutes);
router.use('/artists', artistRoutes);
router.use('/tracks', trackRoutes);
router.use('/search', searchRoutes);
router.use('/images', imageRoutes);
export default router;
