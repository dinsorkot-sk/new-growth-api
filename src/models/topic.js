module.exports = (sequelize, DataTypes) => {
    const Topic = sequelize.define('Topic', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        posted_by: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        is_approved: DataTypes.INTEGER,
        status: {
            type: DataTypes.ENUM('show', 'hide'),
            defaultValue: 'hide',
            allowNull: false,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        tableName: 'topics',
        timestamps: false
    });

    Topic.associate = models => {
        Topic.hasMany(models.TopicAnswer, {
            foreignKey: 'topic_id',
            as: 'answer'
        });
    };

    return Topic;
};
