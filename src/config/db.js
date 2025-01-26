import { set, connect } from 'mongoose';
import { commonConfig } from './env.js';
const logger = require('./logger');

const connectToDb = async () => {
  try {
    set('strictQuery', false);
    await connect(
      `mongodb+srv://${commonConfig.username}:${commonConfig.password}@${commonConfig.cluster}.mongodb.net/?retryWrites=true&w=majority`,
    );
    logger.info('Successfully connected to database');
  } catch (err) {
    logger.error('Database connection error:', err);
  }
};

export default connectToDb;
