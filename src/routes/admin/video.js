const express = require('express');
const router = express.Router();
const uploadVideo = require('../../config/multerVideo');
const videoController = require('../../controller/admin/video')


router.post('/upload-video', uploadVideo.single('video_file'), videoController.createVideo); 

router.put('/update-video/:id', videoController.updateVideo, videoController.updateVideoResource);

module.exports = router
