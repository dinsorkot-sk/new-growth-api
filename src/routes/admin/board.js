const express = require('express');
const router = express.Router();
const boardController = require('../../controller/admin/board');
const upload = require('../../config/multer');

/**
 * @swagger
 * tags:
 *   name: Admin Board
 *   description: Board management endpoints
 */

/**
 * @swagger
 * /api/admin/board:
 *   post:
 *     tags: [Admin Board]
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
 * /api/admin/board/{id}:
 *   delete:
 *     tags: [Admin Board]
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
 * /api/admin/board/{id}:
 *   patch:
 *     tags: [Admin Board]
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

/**
 * @swagger
 * /api/admin/board/media:
 *   post:
 *     tags: [Admin Board]
 *     summary: Upload one or multiple media files (images or videos)
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Media files (image or video)
 *               description:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Description for each media file (order matches files)
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 media:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: No files were uploaded
 *       500:
 *         description: Internal server error
 */
router.post('/', upload.array('image'), boardController.createImages);

router.post('/media', upload.array('media', 10), boardController.createMedia);

router.delete('/:id', boardController.deleteImage);

router.patch('/:id', upload.single('image'), boardController.updateImage);

module.exports = router;