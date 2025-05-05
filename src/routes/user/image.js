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
 * /api/image/getAllImage:
 *   get:
 *     tags: [User Image]
 *     summary: Get paginated image list
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
 *           description: Search keyword for image path
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
router.get('/getAllImage', imageController.getAllImages);

module.exports = router;