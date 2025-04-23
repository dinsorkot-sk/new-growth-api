const express = require('express');
const router = express.Router();
const courseController = require('../controller/courseController');
const upload = require('../config/multer');

router.get('/course', courseController.getAllCourses);
router.get('/course/:id', courseController.getCourseById);
router.post('/course', upload.single('image'), courseController.createCourse);
router.put('/course/:id', upload.single('image'), courseController.updateCourse);
router.delete('/course/:id', courseController.deleteCourse);

module.exports = router;
