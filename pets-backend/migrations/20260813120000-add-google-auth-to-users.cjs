'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'googleId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('users', 'authProvider', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'local'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'authProvider');
    await queryInterface.removeColumn('users', 'googleId');

    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
