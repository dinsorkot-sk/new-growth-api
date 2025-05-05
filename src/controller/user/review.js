const { Review, Course } = require('../../models');

exports.createReview = async (req, res) => {
    try {
        const { username, score, comment, course_id } = req.body;

        // Validate required fields
        if (!username || !course_id) {
            return res.status(400).json({ 
                success: false,
                message: 'Username and course ID are required' 
            });
        }

        // ตรวจสอบว่าคอร์สมีอยู่จริง
        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // สร้างรีวิว
        const newReview = await Review.create({
            username,
            score: score || null,
            comment: comment || null,
            course_id,
            created_at: new Date(),
            updated_at: new Date(),
        });

        res.status(201).json({
            success: true,
            data: newReview
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ฟังก์ชันอื่นๆ เช่น getReviews, updateReview, deleteReview