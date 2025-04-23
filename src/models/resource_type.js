module.exports = (sequelize, DataTypes) => {
    const ResourceType = sequelize.define('ResourceType', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
    }, {
      tableName: 'resource_types',
      timestamps: false,
    });
  
    ResourceType.associate = models => {
      ResourceType.hasMany(models.Resource, {
        foreignKey: 'type_id',
        as: 'resources'
      });
    };
  
    return ResourceType;
  };
  