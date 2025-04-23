module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      industry_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      reresource_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      img_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
    }, {
      tableName: 'courses',
      timestamps: false,
    });
  
    Course.associate = function(models) {
      Course.belongsTo(models.Industry, {
        foreignKey: 'industry_id',
        as: 'industry',
      });
  
      Course.belongsTo(models.Resource, {
        foreignKey: 'reresource_id',
        as: 'resource',
      });
  
      Course.belongsTo(models.Image, {
        foreignKey: 'img_id',
        as: 'image',
      });
    };
  
    return Course;
  };
  