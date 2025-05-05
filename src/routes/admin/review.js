const express = require('express');
const router = express.Router();
const reviewController = require("../../controller/admin/review");

/**
 * @swagger
 * tags:
 *   name: User Reviews
 *   description: Review management endpoints
 */

/**
 * @swagger
 * /api/admin/review:
 *   delete:
 *     tags: [User Reviews]
 *     summary: Delete a review by ID and Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - course_id
 *             properties:
 *               id:
 *                 type: integer
 *               course_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Review or course not found
 *       500:
 *         description: Internal server error
 */
router.delete('/', reviewController.deleteReview);

module.exports = router;
