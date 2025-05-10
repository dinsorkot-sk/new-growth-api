'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('admins', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      comment: 'Email address for password reset'
    });

    await queryInterface.addColumn('admins', 'otp_code', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'OTP code for password reset'
    });

    await queryInterface.addColumn('admins', 'otp_expiry', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expiry date of the OTP'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('admins', 'email');
    await queryInterface.removeColumn('admins', 'otp_code');
    await queryInterface.removeColumn('admins', 'otp_expiry');
  }
};
