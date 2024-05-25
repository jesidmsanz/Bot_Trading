const mongoose = require("mongoose");

let db = null;

module.exports = function setupDatabase(config) {
  if (!db) {
    mongoose.Promise = global.Promise;
    db = mongoose.createConnection(config);
  }
  return db;
};