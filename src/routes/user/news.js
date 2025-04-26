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