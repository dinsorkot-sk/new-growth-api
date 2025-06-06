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
 *               description:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Image description (array, order matches files)
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

/**
 * @swagger
 * /api/admin/image/{id}:
 *   patch:
 *     tags: [Admin Image]
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
router.post('/', upload.array('image'), imageController.createImages);

router.delete('/:id', imageController.deleteImage);

router.patch('/:id', upload.single('image'), imageController.updateImage);

module.exports = router;