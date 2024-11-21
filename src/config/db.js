import { set, connect } from 'mongoose';
import { commonConfig } from './env.js';

const connectToDb = async () => {
  set('strictQuery', false);
  await connect(
    `mongodb+srv://${commonConfig.username}:${commonConfig.password}@${commonConfig.cluster}.mongodb.net/?retryWrites=true&w=majority`,
  )
    .then(() => {
      console.log('successfully connect to database');
    })
    .catch((err) => console.log(err));
};

export default connectToDb;
