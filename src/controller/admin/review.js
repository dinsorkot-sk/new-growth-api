const { Review, Course } = require('../../models');

exports.deleteReview = async (req, res) => {
    try {
        const { id, course_id } = req.body;

        if (!id || !course_id) {
            return res.status(400).json({
                success: false,
                message: 'Review ID and Course ID are required',
            });
        }

        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        const review = await Review.findOne({ where: { id, course_id } });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found for this course',
            });
        }

        await review.destroy();

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
