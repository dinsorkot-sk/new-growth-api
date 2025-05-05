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
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    img_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sub_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    additional_info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instructor: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  }, {
    tableName: 'courses',
    timestamps: false,
  });

  Course.associate = function (models) {
    Course.hasMany(models.Industry, {
      foreignKey: 'course_id',
      as: 'industries',
    });

    Course.belongsTo(models.Resource, {
      foreignKey: 'resource_id',
      as: 'resources',
      onDelete: 'SET NULL',
    });

    Course.belongsTo(models.Image, {
      foreignKey: 'img_id',
      as: 'image',
    });

    Course.hasMany(models.Review,{
      foreignKey: 'course_id',
      as: 'review'
    })
  };

  return Course;
};
