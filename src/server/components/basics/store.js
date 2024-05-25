"use strict";

module.exports = function setup(Model, db) {
  function findById(id) {
    return Model.findById(id);
  }

  function deleteById(_id) {
    return Model.deleteOne({
      _id,
    });
  }

  function findAll() {
    return { Done: "Ok" };
  }

  function findAllActive() {
    return Model.find({ active: true }).sort({ name: 1 }).lean();
  }

  async function create(model) {
    const result = await new Model(model).save();
    return result;
  }

  async function update(_id, model) {
    const cond = { _id };
    const result = await Model.updateOne(cond, model);
    return result ? Model.findOne(cond) : false;
  }

  return {
    findById,
    findAll,
    findAllActive,
    create,
    deleteById,
    update,
  };
};
