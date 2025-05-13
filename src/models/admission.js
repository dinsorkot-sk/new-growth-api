'use strict';
module.exports = (sequelize, DataTypes) => {
  const Admission = sequelize.define('Admission', {
    title: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    selectionStartDate: DataTypes.DATE,
    selectionEndDate: DataTypes.DATE,
    trainingStartDate: DataTypes.DATE,
    link_register: DataTypes.STRING
  }, {});
  return Admission;
};
