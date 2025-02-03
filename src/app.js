import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import logger from './config/logger.js';
import artistRoutes from './routes/artistRoutes.js';

const app = express();

// Configurer CORS avant les autres middlewares
app.use(
  cors({
    origin: 'http://localhost:3000', // URL de votre front-end
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true,
  })
);

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes API
app.use('/api', routes);
app.use('/api/artists', artistRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('Hello, this is the API!');
});

// Middleware de gestion d'erreurs
app.use((err, req, res, _next) => {
  logger.error('Error:', err);
  res.status(500).json({
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
