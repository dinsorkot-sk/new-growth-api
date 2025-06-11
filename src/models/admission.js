'use strict';
module.exports = (sequelize, DataTypes) => {
  const Admission = sequelize.define('Admission', {
    title: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    selectionStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    selectionEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    trainingStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    link_register: DataTypes.STRING
  }, {});
  return Admission;
};
