module.exports = (sequelize, DataTypes) => {
  const TagAssignment = sequelize.define('TagAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    taggable_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    taggable_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE
  }, {
    tableName: 'tag_assignment',
    timestamps: false
  });

  TagAssignment.associate = models => {
    TagAssignment.belongsTo(models.Tag, {
      foreignKey: 'tag_id',
      as: 'tag' // <- สำคัญสำหรับ include
    });
  };

  return TagAssignment;
};
