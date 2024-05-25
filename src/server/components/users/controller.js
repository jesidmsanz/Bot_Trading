import * as uuid from 'uuid';
import * as bcrypt from 'bcrypt';
// const fs = require('fs');
import db from '@/db/index';

function create({ username, password, firstName, lastName, roleId }) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = {
        uuid: uuid.v4(),
        username,
        password,
        firstName,
        lastName,
      };

      const { Users } = await db();

      const exist = await Users.exists(user);
      if (exist) {
        reject(new Error('El usuario ya se encuentra registrado'));
        return false;
      }

      const resultUser = await Users.create(user, roleId);

      resolve(resultUser);
    } catch (error) {
      console.log('ERROR to create user', error);
    }
  });
}

function signUp({ email, password, firstName, lastName }) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = {
        uuid: uuid.v4(),
        username: email,
        email,
        password: bcrypt.hashSync(password, 10),
        firstName,
        lastName,
        roles: ['user'],
      };
      console.log(`user`, user);
      const { Users } = await db();

      const exist = await Users.exists(user);
      if (exist) {
        reject(new Error('El usuario ya se encuentra registrado'));
        return false;
      }

      const resultUser = await Users.create(user);

      resolve(resultUser);
    } catch (error) {
      console.log('ERROR to create user', error);
    }
  });
}

function getUser({ username }) {
  return new Promise(async (resolve, reject) => {
    try {
      const { Users } = await db();

      const user = await Users.findByUsername(username);

      resolve(user);
    } catch (error) {
      reject(error);
    }
  });
}

function getRoles({ username }) {
  return new Promise(async (resolve, reject) => {
    try {
      const { Users } = await db();

      const roles = await Users.getRoles({ username });

      resolve(roles);
    } catch (error) {
      reject(error);
    }
  });
}

function findAll() {
  return new Promise(async (resolve, reject) => {
    const { Users } = await db();

    const result = await Users.findAll();
    resolve(result);
  });
}

function changePassword({ id, currentPassword, newPassword }) {
  return new Promise(async (resolve, reject) => {
    const { Users } = await db();
    //Verificar si la contraseña actual es válida
    const user = await Users.findById(id);
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      resolve('La contraseña actual no coincide');
      return false;
    }
    const password = bcrypt.hashSync(newPassword, 10);
    const result = await Users.changePassword({ id, password });
    resolve(result);
  });
}

function resetPassword({ userId, newPassword }) {
  return new Promise(async (resolve, reject) => {
    const { Users } = await db();
    const password = bcrypt.hashSync(newPassword, 10);
    const result = await Users.changePassword({ id: userId, password });
    resolve(result);
  });
}

function statusChange({ id, statusUserId }, user2) {
  return new Promise(async (resolve, reyect) => {
    const { Users } = await db();
    const { People } = await db();
    //Se buscan los datos del envío
    const userList = await Users.findById(id);

    if (!userList || userList.length === 0) {
      reject(new Error('El usuario no fue encontrado.'));
      return false;
    }
    const user = userList;
    console.log('userList', userList, user);

    //Estado inactivo
    user.statusUserId = statusUserId;
    user.updatedBy = user.id;
    console.log('users', user);
    const savedModel = await Users.statusChange(user);
    const person = await People.findByUserId(user.id);
    console.log('person----', person);

    console.log('savedModel', savedModel);
    resolve({ id: savedModel[0] });
  });
}

module.exports = {
  create,
  signUp,
  getUser,
  findAll,
  getRoles,
  changePassword,
  resetPassword,
  statusChange,
};
