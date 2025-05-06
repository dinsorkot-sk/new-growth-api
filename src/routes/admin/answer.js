const express = require('express');
const router = express.Router();
const answerController = require('../../controller/admin/answer');

/**
 * @swagger
 * tags:
 *   name: Admin Answers
 *   description: Answer management endpoints
 */

/**
 * @swagger
 * /api/admin/answer:
 *   post:
 *     tags: [Admin Answers]
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
 * /api/admin/answer:
 *   get:
 *     tags: [Admin Answers]
 *     summary: Get all answers
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of answers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AnswerResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Internal Server Error
 */
router.get('/', answerController.getAnswers);

/**
 * @swagger
 * /api/admin/answer/{id}:
 *   get:
 *     tags: [Admin Answers]
 *     summary: Get answer by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Answer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnswerResponse'
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', answerController.getAnswer);

/**
 * @swagger
 * /api/admin/answer/{id}:
 *   put:
 *     tags: [Admin Answers]
 *     summary: Update an answer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerUpdate'
 *     responses:
 *       200:
 *         description: Answer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnswerResponse'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', answerController.updateAnswer);

/**
 * @swagger
 * /api/admin/answer/{id}:
 *   delete:
 *     tags: [Admin Answers]
 *     summary: Delete an answer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Answer deleted successfully
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', answerController.deleteAnswer);

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