'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('courses', 'sub_description', {
      type: Sequelize.TEXT('long'),
      allowNull: true, 
    });

    await queryInterface.addColumn('courses', 'additional_info', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('courses', 'sub_description');
    await queryInterface.removeColumn('courses', 'additional_info');
  }
};
