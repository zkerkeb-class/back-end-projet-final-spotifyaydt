import express, { json } from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import connectDB from './src/config/db.js';
import routes from './src/routes/index.js';
import redisClient from './src/config/redis.js'; // Importez le client Redis
import setupSwagger from './src/config/swagger.js'; // Importez la configuration Swagger

const app = express();
app.use(json());

// Configuration de la session avec Redis
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key', // à remplacer par un secret sécurisé
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 }, // 1 heure
  }),
);

// Connexion à la base de données
connectDB();

// Utilisation des routes
app.use('/api', routes); // Utilisez le fichier de routes principal

setupSwagger(app); // Utilisez la configuration Swagger

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
  console.log(`Server running on port ${PORT}`);
});
