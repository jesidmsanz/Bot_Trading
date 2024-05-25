import db from '@/db/index';

function findAll() {
  return new Promise(async (resolve, reject) => {
    const { Basics } = await db();
    const result = await Basics.findAll();
    resolve(result);
  });
}

function findById(id) {
  return new Promise(async (resolve, reject) => {
    const { Basics } = await db();
    const result = await Basics.findById(id);
    resolve(result);
  });
}

function deleteById(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const { Basics } = await db();

      const result = await Basics.deleteById(id);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function create(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const { Basics } = await db();
      const result = await Basics.create(data);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function update(id, form) {
  return new Promise(async (resolve, reject) => {
    try {
      const { Basics } = await db();
      const result = await Basics.update(id, form);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

const controllerBasics = {
  findAll,
  create,
  findById,
  deleteById,
  update,
};
export default controllerBasics;
