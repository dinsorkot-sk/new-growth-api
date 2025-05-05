module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define('Review', {
        username: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        score: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE,
    }, {
        tableName: 'reviews',
        timestamps: false,
    });

    Review.associate = function (models) {
        Review.hasOne(models.Course, {
            foreignKey: 'id',
            as: 'course',
        });
    };

    return Review;
};
