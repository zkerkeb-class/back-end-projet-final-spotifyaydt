import mongoose from 'mongoose';
import { commonConfig } from './env.js';
import { logger } from './logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${commonConfig.username}:${commonConfig.password}@${commonConfig.cluster}.mongodb.net/?retryWrites=true&w=majority`
    );

    logger.info('MongoDB connecté avec succès');

    mongoose.connection.on('error', (err) => {
      logger.error('Erreur MongoDB:', err);
    });
  } catch (error) {
    logger.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
