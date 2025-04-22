module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event', {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      event_date: {
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
      tableName: 'events',
      timestamps: false,
    });
  
    Event.associate = (models) => {
      Event.belongsTo(models.Image, {
        foreignKey: 'img_id',
        as: 'image',
      });
    };

  
    return Event;
  };
  