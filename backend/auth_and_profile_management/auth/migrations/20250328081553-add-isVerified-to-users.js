"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "isVerified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Default akun belum terverifikasi
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "isVerified");
  },
};
