'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'view_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0, // ค่าพื้นฐาน
      allowNull: false, // ไม่ให้เป็น null
    });
    await queryInterface.addColumn('courses', 'description_about', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('courses', 'description_sub', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('courses', 'view_count');
    await queryInterface.removeColumn('courses', 'description_about');
    await queryInterface.removeColumn('courses', 'description_sub');
  }
};
