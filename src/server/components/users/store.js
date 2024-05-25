'use strict';

module.exports = function setupUser(UserModel, RoleUserModel, db) {
  function findById(id) {
    return UserModel.findByPk(id);
  }

  async function exists(user) {
    const cond = {
      $or: [{ uuid: user.uuid }, { username: user.username }, { email: user.email }],
    };
    const exists = await UserModel.findOne(cond).lean();
    return exists;
  }

  async function addToRole(user, roleId) {
    const role = await new RoleUserModel({ userId: user.id, roleId }).save();
    return role;
  }

  async function getRoles({ id, username }) {
    const cond = {
      $or: [{ id: id || 0 }, { username: username || '' }],
      // where: {
      //   [Op.or]: [{ id: id || 0 }, { username: username || '' }],
      // },
      // include: 'roles',
      // raw: true,
    };
    const user = await UserModel.find(cond);
    const roles = user.reduce((rolesList, item) => {
      rolesList.push(item['roles.name']);
      return rolesList;
    }, []);
    return roles;
  }

  async function createOrUpdate(user) {
    const existingUser = await exists(user);
    if (existingUser) {
      const updated = await UserModel.updated(user, cond);
      return updated ? UserModel.findOne(cond) : existingUser;
    }

    const result = await UserModel.create(user);
    return result.toJSON();
  }

  async function create(user) {
    const myModel = new UserModel(user);
    await myModel.save();
    const result = { ...myModel };
    console.log(`myModel`, myModel);
    console.log(`result`, result._doc);
    return result._doc;
  }

  function findByUuid(uuid) {
    return UserModel.findOne({
      where: {
        uuid,
      },
    });
  }

  function findAll() {
    return UserModel.find();
  }

  function findByUsername(username) {
    return UserModel.findOne({
      username,
    }).lean();
  }

  async function changePassword({ id, password }) {
    const result = await UserModel.update(
      { password },
      {
        where: {
          id,
        },
      }
    );
    return result;
  }

  function statusChange({ id, statusUserId, updatedBy }) {
    const cond = {
      where: {
        id,
      },
    };
    return UserModel.update({ statusUserId, updatedBy }, cond);
  }

  return {
    findById,
    exists,
    createOrUpdate,
    create,
    findByUuid,
    findAll,
    findByUsername,
    addToRole,
    getRoles,
    changePassword,
    statusChange,
  };
};
