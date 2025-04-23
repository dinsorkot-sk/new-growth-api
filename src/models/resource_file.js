module.exports = (sequelize, DataTypes) => {
    const ResourceFile = sequelize.define('ResourceFile', {
      resource_id: DataTypes.INTEGER,
      file_type: DataTypes.STRING,
      file_path: DataTypes.STRING,
      is_downloadable: DataTypes.BOOLEAN,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
    }, {
      tableName: 'resource_files',
      timestamps: false,
    });
  
    ResourceFile.associate = models => {
      ResourceFile.belongsTo(models.Resource, {
        foreignKey: 'resource_id',
        as: 'resource'
      });
    };
  
    return ResourceFile;
  };
  