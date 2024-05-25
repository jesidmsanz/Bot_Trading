const configEnv = require("../../configEnv");

const configMongoDB = configEnv.dbPassword
  ? `mongodb://${configEnv.dbUser}:${configEnv.dbPassword}@${configEnv.dbHost}:${configEnv.dbPort}/${configEnv.dbName}`
  : `mongodb://${configEnv.dbHost}:${configEnv.dbPort}/${configEnv.dbName}`;

module.exports = { configMongoDB };
