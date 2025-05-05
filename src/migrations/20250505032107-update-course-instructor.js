'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'instructor', {
      type: Sequelize.TEXT,
      allowNull: true, 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('courses', 'instructor');
  }
};
