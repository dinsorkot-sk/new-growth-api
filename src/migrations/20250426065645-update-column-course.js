'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ลบคอลัมน์ industry_id จาก course
    await queryInterface.removeColumn('courses', 'industry_id');

    // เพิ่มคอลัมน์ course_id ใน industries
    await queryInterface.addColumn('industries', 'course_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // หรือ false ถ้าต้องการบังคับให้มีค่า
      references: {
        model: 'courses', // ต้องตรงกับชื่อ table จริงในฐานข้อมูล
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    // กลับการเปลี่ยนแปลง: เพิ่ม industry_id กลับเข้า course
    await queryInterface.addColumn('courses', 'industry_id', {
      type: Sequelize.INTEGER
    });

    // ลบ course_id ออกจาก industries
    await queryInterface.removeColumn('industries', 'course_id');
  }
};
