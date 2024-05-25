import db from './models';
import { configMongoDB } from './config';

function setup() {
  return db(configMongoDB);
}

export default setup;
