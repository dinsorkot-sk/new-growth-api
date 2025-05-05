'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('courses', 'reresource_id');
    await queryInterface.addColumn('courses', 'resource_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'resources',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('courses', 'resource_id');
    await queryInterface.addColumn('courses', 'reresource_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'resources',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};
