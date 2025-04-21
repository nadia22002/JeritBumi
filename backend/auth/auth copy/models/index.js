"use strict";
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../config/config");

const db = {};
console.log(env, "<< env");
console.log(config, "<< config");

const configEnv = config[process.env.NODE_ENV];

let sequelize;
if (configEnv.use_env_variable) {
  console.log("<< use_env");

  console.log(configEnv.use_env_variable, "<< env_var");
  console.log({ ...configEnv }, "<< config");

  sequelize = new Sequelize(process.env[configEnv.use_env_variable], {
    ...configEnv,
  });
} else {
  console.log("<< else");

  console.log(configEnv.use_env_variable, "<< env_var");
  console.log(configEnv, "<< config");

  sequelize = new Sequelize(
    configEnv.database,
    configEnv.username,
    configEnv.password,
    configEnv
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
