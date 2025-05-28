module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
      ref_id: {
        type: DataTypes.INTEGER,
      },
      ref_type: {
        type: DataTypes.STRING,
      },
      image_path: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
      description: {
        type: DataTypes.TEXT,
      }
    }, {
      tableName: 'images',
      timestamps: false,
      underscored: true
    });

    Image.associate = (models) => {
      Image.belongsTo(models.News, {
        foreignKey: 'ref_id',
        as: 'news'
      });
    };
  
    return Image;
  };
  