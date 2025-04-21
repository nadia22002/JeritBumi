"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      notelp: DataTypes.STRING,
      alamat: DataTypes.STRING,
      role: DataTypes.ENUM("admin", "user"),
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,  // Default akun belum terverifikasi
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true, // Bisa null sebelum user melakukan verifikasi
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );  
  return User;
};
