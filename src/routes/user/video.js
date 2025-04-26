const express = require('express');
const router = express.Router();
const videoController = require('../../controller/user/video')


/**
 * @swagger
 * /api/video/getAllVideo:
 *   get:
 *     tags: [User Videos]
 *     summary: Get all videos with pagination
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of items to return
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter videos
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [show, hide]
 *         description: Filter by video status
 *       - in: query
 *         name: is_downloadable
 *         schema:
 *           type: boolean
 *         description: Filter by downloadable status
 *     responses:
 *       200:
 *         description: Paginated list of videos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoListResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/getAllVideo', videoController.getAllVideoResource);

/**
 * @swagger
 * /api/video/getVideoById/{id}:
 *   get:
 *     tags: [User Videos]
 *     summary: Get video by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoResponse'
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */
router.get('/getVideoById/:id', videoController.getVideoById);

/**
 * @swagger
 * /api/video/downloadVideo/{id}:
 *   get:
 *     tags: [User Videos]
 *     summary: Download video by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video file
 *         content:
 *           video/*:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Video is not downloadable
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */
router.get('/downloadVideo/:id', videoController.downloadVideo);

/**
 * @swagger
 * components:
 *   schemas:
 *     VideoListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VideoResponse'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 * 
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
 * 
 *     Pagination:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         currentPage:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         prev:
 *           type: string
 *           nullable: true
 *         next:
 *           type: string
 *           nullable: true
 */

module.exports = router;