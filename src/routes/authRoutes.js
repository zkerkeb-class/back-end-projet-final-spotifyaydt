import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// Route de login
router.post('/', authController.login);

export default router;
