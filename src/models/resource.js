module.exports = (sequelize, DataTypes) => {
    const Resource = sequelize.define('Resource', {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      type: DataTypes.TEXT,
      duration: DataTypes.STRING,
      pages: DataTypes.INTEGER,
      author: DataTypes.STRING,
      published_date: DataTypes.DATE,
      status: DataTypes.ENUM('show', 'hide'),
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
    }, {
      tableName: 'resources',
      timestamps: false,
    });
  
    Resource.associate = models => {
      Resource.belongsTo(models.Course, {
        foreignKey: 'resource_id',
        as: 'course',
      });

      Resource.hasMany(models.ResourceFile, {
        foreignKey: 'resource_id',
        as: 'files'
      });
    };
  
    return Resource;
  };
  