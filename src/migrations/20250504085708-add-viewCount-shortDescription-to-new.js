'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('news', 'view_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0, // ค่าพื้นฐาน
      allowNull: false, // ไม่ให้เป็น null
    });

    await queryInterface.addColumn('news', 'short_description', {
      type: Sequelize.STRING,
      allowNull: true, // ให้เป็น null ได้
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('news', 'view_count');
    await queryInterface.removeColumn('news', 'short_description');
  }
};
