// server.js
import express, { json } from 'express';
import connectDB from './src/config/db.js'; // Fichier qui contient la logique de connexion

const app = express();

app.use(json());

// Connexion à la base de données
connectDB();

// Exemple de route
app.get('/', (req, res) => {
  res.send('Hello, this is the API!');
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
