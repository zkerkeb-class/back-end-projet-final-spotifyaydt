import { commonConfig } from './env.js';
import logger from './logger.js'; // Importation ES Module, en supposant un export par défaut dans logger.js
import { connect } from 'mongoose'; // Assure-toi de bien importer `connect` depuis Mongoose

const connectToDb = async () => {
  try {
    set('strictQuery', false);
    await connect(
      `mongodb+srv://${commonConfig.username}:${commonConfig.password}@${commonConfig.cluster}.mongodb.net/?retryWrites=true&w=majority`
    );
    logger.info('Successfully connected to database');
  } catch (err) {
    logger.error('Database connection error:', err);
  }
};

export default connectToDb;
