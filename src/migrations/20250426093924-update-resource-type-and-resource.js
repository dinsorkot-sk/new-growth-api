'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. ลบ foreign key constraint
    await queryInterface.removeConstraint('resources', 'resources_ibfk_1'); // ชื่อตาม error เดิม

    // 2. ลบคอลัมน์ type_id
    await queryInterface.removeColumn('resources', 'type_id');

    // 3. เพิ่มคอลัมน์ type
    await queryInterface.addColumn('resources', 'type', {
      type: Sequelize.STRING, // หรือ Sequelize.TEXT ก็ได้
      allowNull: false,
      defaultValue: 'Video', // หรือไม่ใส่ default ก็ได้ตามที่อยากได้
    });
  },

  down: async (queryInterface, Sequelize) => {
    // ย้อนกลับ (เผื่อ rollback)
    await queryInterface.removeColumn('resources', 'type');
    await queryInterface.addColumn('resources', 'type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'resource_types',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
};
