import mongoose from 'mongoose'; // Assure-toi d'importer mongoose pour utiliser set et connect
import { commonConfig } from './env.js';
import logger from './logger.js';

const connectToDb = async () => {
  try {
    // Assure-toi d'utiliser la méthode mongoose.set() pour configurer 'strictQuery'
    mongoose.set('strictQuery', false);

    // Connexion à MongoDB avec l'URI et options recommandées
    await mongoose.connect(
      `mongodb+srv://${commonConfig.username}:${commonConfig.password}@${commonConfig.cluster}.mongodb.net/?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // Délai d'attente pour la connexion
        socketTimeoutMS: 45000, // Délai d'attente pour les opérations
      }
    );

    logger.info('Successfully connected to the database');
  } catch (err) {
    logger.error('Database connection error:', err);
    process.exit(1); // Facultatif : arrête l'application si la connexion échoue
  }
};

export default connectToDb;
