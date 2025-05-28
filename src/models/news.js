// src/models/news.js

module.exports = (sequelize, DataTypes) => {
  const News = sequelize.define('News', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT('long'),
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
    short_description:{
      type: DataTypes.TEXT,
      allowNull: true,
    },
    view_count : {
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
    // แก้ไขให้ใช้ models.Image หรือ models.Images ให้ถูกต้อง
    // (ตรวจสอบว่าโมเดลชื่ออะไรที่มีอยู่จริง)
    News.belongsTo(models.Image, {
      foreignKey: 'img_id',
      as: 'image',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // แก้ไขให้ใช้ models.TagAssignment
    News.hasMany(models.TagAssignment, {
      foreignKey: 'taggable_id',
      constraints: false,
      scope: {
        taggable_type: 'news'
      },
      as: 'tagAssignments'
    });

    // Resource association for videos
    News.hasMany(models.Resource, {
      foreignKey: 'news_id',
      as: 'resources',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    News.hasMany(models.Image, {
      foreignKey: 'ref_id',
      as: 'images',
      scope: { ref_type: 'news' }
    });
  };

  return News;
};
