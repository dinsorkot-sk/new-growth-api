const express = require('express');
const router = express.Router();
const imageController = require('../../controller/user/image');

/**
 * @swagger
 * tags:
 *   name: User Image
 *   description: Image browsing endpoints for users
 */

/**
 * @swagger
 * /api/image/getAllImage/{ref_type}:
 *   get:
 *     tags: [User Image]
 *     summary: Get paginated image list (optionally filtered by ref_type)
 *     parameters:
 *       - in: path
 *         name: ref_type
 *         required: false
 *         schema:
 *           type: string
 *         description: Reference type to filter images (e.g., course, event)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Pagination offset
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Pagination limit
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword for image path
 *     responses:
 *       200:
 *         description: Paginated image list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Image'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     offset:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/getAllImage/:ref_type?', imageController.getAllImages);

module.exports = router;