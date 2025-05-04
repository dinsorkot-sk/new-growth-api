'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('news', 'content', {
      type: Sequelize.TEXT('long'), // หรือ Sequelize.TEXT / Sequelize.TEXT('medium') ตามต้องการ
      allowNull: true, // ปรับตามความเหมาะสม
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('news', 'content', {
      type: Sequelize.STRING(255), // สมมติว่าเดิมใช้ VARCHAR(255)
      allowNull: true, // ปรับให้เหมือนเดิม
    });
  }
};
