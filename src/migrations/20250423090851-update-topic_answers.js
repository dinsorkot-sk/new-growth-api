'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('topic_answers', 'status', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: 'hide'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('topic_answers', 'status');
  }
};
