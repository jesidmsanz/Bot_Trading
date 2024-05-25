'use strict';

const setupDatabase = require('../lib/mongodb');
const setupBasicsModel = require('../../components/basics/model');
const setupUsersModel = require('../../components/users/model');

////////////

const setupBasics = require('../../components/basics/store');
const setupUsers = require('../../components/users/store');

module.exports = async (config) => {
  const db = setupDatabase(config);

  const BasicsModel = setupBasicsModel(db);
  const UsersModel = setupUsersModel(db);

  const Basics = setupBasics(BasicsModel, db);
  const Users = setupUsers(UsersModel, db);

  return {
    Basics,
    Users,
  };
};
