const express = require('express');
const router = express.Router();
const uploadVideo = require('../../config/multerVideo');
const videoController = require('../../controller/admin/video')


router.post('/upload-video', uploadVideo.single('video_file'), videoController.createVideo); 


module.exports = router
