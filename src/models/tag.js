module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE
  }, {
    tableName: 'tag',
    timestamps: false
  });

  // การเชื่อมโยงกับ TagAssignment
  Tag.associate = models => {
    // TagAssignment - Tag
    Tag.hasMany(models.TagAssignment, {
      foreignKey: 'tag_id',
      as: 'assignments'
    });

  };

  return Tag;
};
