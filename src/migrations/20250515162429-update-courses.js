'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // เปลี่ยนคอลัมน์เป็น LONGTEXT เก็บข้อมูลได้มากที่สุด
    await queryInterface.changeColumn('courses', 'name', {
      type: Sequelize.TEXT('long'),
      allowNull: false
    });
    await queryInterface.changeColumn('courses', 'description', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
    await queryInterface.changeColumn('courses', 'description_about', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
    await queryInterface.changeColumn('courses', 'description_sub', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
    await queryInterface.changeColumn('courses', 'instructor', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
  },
  
  async down (queryInterface, Sequelize) {
    // กลับไปเป็นชนิดเดิม
    await queryInterface.changeColumn('courses', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('courses', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('courses', 'description_about', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('courses', 'description_sub', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('courses', 'instructor', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  } 
};
