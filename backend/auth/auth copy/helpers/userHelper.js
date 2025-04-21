const db = require("../models");

const getUserByEmail = async (email) => {
  const result = await db.User.findOne({
    where: {
      email,
    },
  });

  return result;
};

const createUser = async (name, user_id) => {
  await db.User.create({
    name: name,
    user_id: user_id,
  });
};

module.exports = { 
  getUserByEmail,
  createUser };