module.exports = (sequelize, DataTypes) => {
    const Industry = sequelize.define('Industry', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      course_id : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
    }, {
      tableName: 'industries',
      timestamps: false,
    });
  
    Industry.associate = function(models) {
      Industry.hasMany(models.Course, {
        foreignKey: 'id',
        as: 'courses',
      });
    };
  
    return Industry;
  };
  