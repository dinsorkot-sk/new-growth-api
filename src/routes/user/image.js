const express = require('express');
const router = express.Router();
const imageController = require('../../controller/user/image');
const upload = require('../../config/multer');

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

/**
 * @swagger
 * /api/image:
 *   post:
 *     tags: [User Image]
 *     summary: Upload an image
 *     consumes:
 *       - multipart/form-data
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
 *               ref_type:
 *                 type: string
 *               description:
 *                 type: string
 *                 description: Image description
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 image:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.post('/', upload.single('image'), imageController.createImage);

/**
 * @swagger
 * /api/image/{id}:
 *   patch:
 *     tags: [User Image]
 *     summary: Update an image's description or file
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the image to update
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *                 description: Image description
 *     responses:
 *       200:
 *         description: Image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 image:
 *                   type: object
 *       404:
 *         description: Image not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', upload.single('image'), imageController.updateImage);

module.exports = router;