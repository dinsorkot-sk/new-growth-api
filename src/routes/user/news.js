const express = require('express');
const router = express.Router();
const newsController = require("../../controller/user/news");
const upload = require("../../config/multer");

/**
 * @swagger
 * tags:
 *   name: User News
 *   description: News management endpoints
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     tags: [User News]
 *     summary: Get paginated news list
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Internal server error
 */
router.get('/', newsController.getAllNews);

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     tags: [User News]
 *     summary: Get news article by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 * /api/news/view/{id}:
 *   put:
 *     tags: [User News]
 *     summary: Update news view count
 *     description: อัปเดตจำนวนการเข้าดูข่าว
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID ของข่าว
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
 *                 example: 100
 *                 description: จำนวนการเข้าดูใหม่
 *     responses:
 *       200:
 *         description: อัปเดตจำนวนการเข้าดูสำเร็จ
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
 *         description: ไม่พบข่าว
 *         content:
 *           application/json:
 *             example:
 *               message: "News not found"
 *       500:
 *         description: เกิดข้อผิดพลาดบนเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             example:
 *               message: "Error updating news"
 *               error: "Error message details"
 */

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
 *         short_description:
 *           type: string
 *         view_count:
 *           type: integer
 *           description: จำนวนการเข้าดู (เพิ่มเข้าใหม่)
 *         image:
 *           $ref: '#/components/schemas/Image'
 *         tagAssignments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TagAssignment'
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