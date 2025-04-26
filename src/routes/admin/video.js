const express = require('express');
const router = express.Router();
const uploadVideo = require('../../config/multerVideo');
const videoController = require('../../controller/admin/video')


/**
 * @swagger
 * tags:
 *   name: Admin Videos
 *   description: Video management endpoints
 */

/**
 * @swagger
 * /api/admin/video/upload-video:
 *   post:
 *     tags: [Admin Videos]
 *     summary: Upload a new video
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video_file:
 *                 type: string
 *                 format: binary
 *                 description: The video file to upload
 *               title:
 *                 type: string
 *                 example: "vnaenzhiTwaahjTaupdate"
 *               description:
 *                 type: string
 *                 example: "%f1a4rwfxwarsuu"
 *               duration:
 *                 type: integer
 *                 example: 120
 *               author:
 *                 type: string
 *                 example: "japan"
 *               status:
 *                 type: string
 *                 enum: [show, hide]
 *                 default: "show"
 *               is_downloadable:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoResponse'
 *       400:
 *         description: Bad request (invalid file or missing fields)
 *       500:
 *         description: Internal server error
 */
router.post('/upload-video', uploadVideo.single('video_file'), videoController.createVideo);

/**
 * @swagger
 * /api/admin/video/update-video/{id}:
 *   put:
 *     tags: [Admin Videos]
 *     summary: Update video information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "vnaenzhiTwaahjTaupdate"
 *               description:
 *                 type: string
 *                 example: "%f1a4rwfxwarsuu"
 *               duration:
 *                 type: integer
 *                 example: 120
 *               author:
 *                 type: string
 *                 example: "japan"
 *               status:
 *                 type: string
 *                 enum: [show, hide]
 *                 default: "show"
 *               is_downloadable:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Video updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoResponse'
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */
router.put('/update-video/:id', videoController.updateVideo, videoController.updateVideoResource);

/**
 * @swagger
 * /api/admin/video/delete/{id}:
 *   delete:
 *     tags: [Admin Videos]
 *     summary: Delete a video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', videoController.deleteVideo);

/**
 * @swagger
 * components:
 *   schemas:
 *     VideoResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *           example: "vnaenzhiTwaahjTaupdate"
 *         description:
 *           type: string
 *           example: "%f1a4rwfxwarsuu"
 *         video_url:
 *           type: string
 *         thumbnail_url:
 *           type: string
 *         duration:
 *           type: integer
 *           example: 120
 *         author:
 *           type: string
 *           example: "japan"
 *         status:
 *           type: string
 *           enum: [show, hide]
 *           default: "show"
 *         is_downloadable:
 *           type: boolean
 *           default: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */



module.exports = router
