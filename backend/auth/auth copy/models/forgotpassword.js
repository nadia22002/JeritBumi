"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ForgotPassword extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ForgotPassword.belongsTo(models.User, {
        as: "user",
        foreignKey: "user_id",
      });
    }
  }
  ForgotPassword.init(
    {
      token: DataTypes.STRING,
      expiresIn: DataTypes.DATE,
      user_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ForgotPassword",
    }
  );
  return ForgotPassword;
};