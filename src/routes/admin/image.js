const express = require('express');
const router = express.Router();
const imageController = require('../../controller/admin/image');
const upload = require('../../config/multer');

/**
 * @swagger
 * tags:
 *   name: Admin Image
 *   description: Image management endpoints
 */

/**
 * @swagger
 * /api/admin/image:
 *   post:
 *     tags: [Admin Image]
 *     summary: Upload one or multiple images
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
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/image/{id}:
 *   delete:
 *     tags: [Admin Image]
 *     summary: Delete an image by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Image not found
 *       500:
 *         description: Internal server error
 */
router.post('/', upload.array('image'), imageController.createImages);

router.delete('/:id', imageController.deleteImage);

module.exports = router;