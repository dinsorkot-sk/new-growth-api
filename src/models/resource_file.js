module.exports = (sequelize, DataTypes) => {
  const ResourceFile = sequelize.define('ResourceFile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'resources', 
        key: 'id'
      }
    },
    file_type: {
      type: DataTypes.STRING
    },
    file_path: {
      type: DataTypes.STRING
    },
    is_downloadable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'resource_files', 
    timestamps: true, 
    underscored: true, 
    paranoid: true 
  });

  ResourceFile.associate = (models) => {
    ResourceFile.belongsTo(models.Resource, {
      foreignKey: 'resource_id',
      as: 'resource'
    });
  };

  return ResourceFile;
};