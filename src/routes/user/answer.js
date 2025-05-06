const express = require('express');
const router = express.Router();
const answerController = require('../../controller/user/answer');

/**
 * @swagger
 * tags:
 *   name: User Answers
 *   description: Answer management endpoints
 */

/**
 * @swagger
 * /api/answer:
 *   post:
 *     tags: [User Answers]
 *     summary: Create a new answer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerInput'
 *     responses:
 *       201:
 *         description: Answer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnswerResponse'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Topic not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/', answerController.createAnswer);

/**
 * @swagger
 * components:
 *   schemas:
 *     AnswerInput:
 *       type: object
 *       required:
 *         - topic_id
 *         - answer_text
 *         - answered_by
 *       properties:
 *         topic_id:
 *           type: integer
 *           example: 1
 *         answer_text:
 *           type: string
 *           example: "This is a sample answer"
 *         answered_by:
 *           type: string
 *           example: "John Doe"
 *         status:
 *           type: string
 *           enum: [show, hide]
 *           default: hide
 * 
 *     AnswerUpdate:
 *       type: object
 *       properties:
 *         answer_text:
 *           type: string
 *           example: "Updated answer text"
 *         answered_by:
 *           type: string
 *           example: "Jane Smith"
 *         status:
 *           type: string
 *           enum: [show, hide]
 * 
 *     AnswerResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         topic_id:
 *           type: integer
 *         answer_text:
 *           type: string
 *         answered_by:
 *           type: string
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
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