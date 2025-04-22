


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
      }
    }, {
      tableName: 'images',
      timestamps: false,
      underscored: true
    });
  
    return Image;
  };
  