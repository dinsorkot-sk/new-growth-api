// src/models/news.js



module.exports = (sequelize, DataTypes) => {
    const News = sequelize.define('News', {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      published_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('show', 'hide'),
        defaultValue: 'hide',
        allowNull: false,
      },
      img_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
    }, {
      tableName: 'news',
      timestamps: false,
    });

    News.associate = (models) => {
      News.belongsTo(models.Image, {
        foreignKey: 'img_id',
        as: 'image',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    };
  
    return News;
  }; 


  