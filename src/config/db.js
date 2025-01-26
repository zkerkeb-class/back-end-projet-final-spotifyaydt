import { set, connect } from 'mongoose';
import { commonConfig } from './env.js';
import logger from './logger.js';

const connectToDb = async () => {
  set('strictQuery', false);
  await connect(
    `mongodb+srv://${commonConfig.username}:${commonConfig.password}@${commonConfig.cluster}.mongodb.net/?retryWrites=true&w=majority`,
  )
    .then(() => {
      logger.info('successfully connect to database');
    })
    .catch((err) => logger.info(err));
};

export { connectToDb };
