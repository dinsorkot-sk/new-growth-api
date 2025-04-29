const express = require('express');
const router = express.Router();
const courseController = require("../../controller/admin/course");
const upload = require("../../config/multer");
const uploadVideo = require('../../config/multerVideo');   




const multer = require('multer');
const path = require('path');

const combinedStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype.startsWith('video/')) {
            cb(null, path.join(__dirname, '../../../video'));
        } else if (file.mimetype.startsWith('image/')) {
            cb(null, 'upload');
        } else {
            cb(new Error('Invalid file type'), null);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadBoth = multer({ 
    storage: combinedStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed!'), false);
        }
    }
});

router.post('/create-course', uploadBoth.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), courseController.createCourse);

module.exports = router;
