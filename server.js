import express, { json } from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import connectDB from './src/config/db.js';
import routes from './src/routes/index.js';
import redisClient from './src/config/redis.js';
import setupSwagger from './src/config/swagger.js';

const app = express();

// Configuration CORS - à ajouter avant les autres middlewares
app.use(
  cors({
    origin: 'http://localhost:3000', // URL de votre application React
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Nécessaire si vous utilisez des sessions/cookies
  })
);

app.use(json());

// Configuration de la session avec Redis
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 },
  })
);

// Connexion à la base de données
connectDB();

// Utilisation des routes
app.use('/api', routes);

setupSwagger(app);

// Exemple de route pour tester les sessions
app.get('/session', (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.send(`Vous avez visité cette page ${req.session.views} fois`);
  } else {
    req.session.views = 1;
    res.send('Bienvenue sur cette page !');
  }
});

// Route de test
app.get('/', (req, res) => {
  res.send('Hello, this is the API!');
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
