const express = require('express');
const router = express.Router();
const newsController = require("../../controller/admin/news");
const upload = require("../../config/multer");

/**
 * @swagger
 * tags:
 *   name: Admin News
 *   description: News management endpoints
 */

/**
 * @swagger
 * /api/admin/news:
 *   post:
 *     tags: [Admin News]
 *     summary: Create new news article
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - published_date
 *             properties:
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple image files can be uploaded
 *               image_description:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Description for each image
 *               video:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple video files can be uploaded
 *               video_description:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Description for each video
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               published_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [show, hide]
 *                 default: show
 *               short_description:
 *                 type: string
 *               tag:
 *                 type: string
 *                 description: JSON array of tags (e.g., ["breaking","sport"])
 *     responses:
 *       201:
 *         description: News created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "News created"
 *                 data:
 *                   $ref: '#/components/schemas/NewsResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating news"
 *                 error:
 *                   type: string
 */
router.post('/', upload.fields([
    { name: 'image', maxCount: 5 },
    { name: 'video', maxCount: 5 }
]), newsController.createNews);

/**
 * @swagger
 * /api/admin/news:
 *   get:
 *     tags: [Admin News]
 *     summary: Get paginated news list
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of records to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of records to return
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title, content, or short description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by tag category
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order for published_date
 *     responses:
 *       200:
 *         description: Paginated news list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NewsResponse'
 *                 tag:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Internal server error
 */
router.get('/', newsController.getAllNews);

/**
 * @swagger
 * /api/admin/news/{id}:
 *   get:
 *     tags: [Admin News]
 *     summary: Get news article by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News ID
 *     responses:
 *       200:
 *         description: News details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewsResponse'
 *       404:
 *         description: News not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', newsController.getNewsById);

/**
 * @swagger
 * /api/admin/news/{id}:
 *   put:
 *     tags: [Admin News]
 *     summary: Update news article
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               video:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple video files can be uploaded
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               published_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [show, hide]
 *               short_description:
 *                 type: string
 *               tag:
 *                 type: string
 *                 description: JSON array of tags (e.g., ["breaking","sport"])
 *               keepVideoIds:
 *                 type: string
 *                 description: JSON array of video ids (e.g., ["1","2"])
 *     responses:
 *       200:
 *         description: News updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "News updated"
 *                 data:
 *                   $ref: '#/components/schemas/NewsResponse'
 *       404:
 *         description: News not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 5 }
]), newsController.updateNews);

/**
 * @swagger
 * /api/admin/news/{id}:
 *   delete:
 *     tags: [Admin News]
 *     summary: Delete news article
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News ID
 *     responses:
 *       200:
 *         description: News deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "News deleted"
 *       404:
 *         description: News not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', newsController.deleteNews);

/**
 * @swagger
 * /api/admin/news/view/{id}:
 *   put:
 *     tags: [Admin News]
 *     summary: Update news view count
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - view_count
 *             properties:
 *               view_count:
 *                 type: integer
 *                 description: New view count
 *     responses:
 *       200:
 *         description: View count updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "News updated"
 *                 data:
 *                   $ref: '#/components/schemas/NewsResponse'
 *       404:
 *         description: News not found
 *       500:
 *         description: Internal server error
 */
router.put('/view/:id', newsController.updateView)

/**
 * @swagger
 * components:
 *   schemas:
 *     NewsResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         published_date:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [show, hide]
 *         short_description:
 *           type: string
 *         view_count:
 *           type: integer
 *         image:
 *           $ref: '#/components/schemas/Image'
 *         tagAssignments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TagAssignment'
 *     
 *     Image:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         image_path:
 *           type: string
 *     
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *     
 *     TagAssignment:
 *       type: object
 *       properties:
 *         tag:
 *           $ref: '#/components/schemas/Tag'
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