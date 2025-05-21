'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('resources', 'news_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'news',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add index for better query performance
    await queryInterface.addIndex('resources', ['news_id'], {
      name: 'resources_news_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Then remove the column
    await queryInterface.removeColumn('resources', 'news_id');
  }
};
