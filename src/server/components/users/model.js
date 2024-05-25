/* eslint-disable no-param-reassign */
/* eslint-disable space-before-function-paren */

const { Schema } = require('mongoose');

// Creating our User model
//Set it as export because we will need it required on the server
const Model = new Schema(
  {
    uuid: {
      type: String,
      required: true,
      comment: 'Code',
    },
    username: {
      type: String,
      required: true,
      comment: 'Username',
    },
    email: {
      type: String,
      required: false,
      comment: 'email',
    },
    // The password cannot be null
    password: {
      type: String,
      required: true,
      comment: 'Password',
    },
    firstName: {
      type: String,
      required: true,
      comment: 'firstName',
    },
    lastName: {
      type: String,
      required: false,
      comment: 'lastName',
    },
    roles: {
      type: [String],
      required: false,
      comment: 'roles',
    },
    // statusId: {
    //   type: Sequelize.INTEGER,
    //   required: true,
    //   comment: 'Estado',
    //   default: 1,
    // },
    createdAt: {
      type: Date,
      required: false,
      comment: 'created At',
    },
    updatedAt: {
      type: Date,
      required: false,
      comment: 'updated At',
    },
  },
  { id: true }
);

module.exports = (db) => {
  return db.model('users', Model);
};
