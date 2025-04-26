module.exports = (sequelize, DataTypes) => {
    const TopicAnswer = sequelize.define('TopicAnswer', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        topic_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        answer_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        answered_by: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('show', 'hide'),
            defaultValue: 'hide',
            allowNull: false,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        tableName: 'topic_answers',
        timestamps: false
    });

    TopicAnswer.associate = models => {
        TopicAnswer.belongsTo(models.Topic, {
            foreignKey: 'id',
            as: 'Topic' // <- สำคัญสำหรับ include
        });
    };


    return TopicAnswer;
};
