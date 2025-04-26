const express = require('express');
const router = express.Router();
const topicController = require('../../controller/user/topic');

/**
 * @swagger
 * tags:
 *   name: User Topics
 *   description: Topic management endpoints
 */

/**
 * @swagger
 * /api/topic:
 *   get:
 *     tags: [User Topics]
 *     summary: Get paginated topics
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
 *         description: Paginated topics list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicListResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/', topicController.getAllTopics);

/**
 * @swagger
 * /api/topic/{id}:
 *   get:
 *     tags: [User Topics]
 *     summary: Get topic by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Topic details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicResponse'
 *       404:
 *         description: Topic not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', topicController.getTopicById);

/**
 * @swagger
 * components:
 *   schemas:
 *     TopicRequest:
 *       type: object
 *       required:
 *         - title
 *         - posted_by
 *       properties:
 *         title:
 *           type: string
 *           example: "New Topic"
 *         posted_by:
 *           type: string
 *           example: "admin"
 *         is_approved:
 *           type: integer
 *           enum: [0, 1]
 *           default: 0
 *         status:
 *           type: string
 *           enum: [show, hide]
 *           default: hide
 *         answers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AnswerRequest'
 *     
 *     AnswerRequest:
 *       type: object
 *       required:
 *         - answer_text
 *         - answered_by
 *       properties:
 *         answer_text:
 *           type: string
 *           example: "This is an answer"
 *         answered_by:
 *           type: string
 *           example: "user123"
 *         status:
 *           type: string
 *           enum: [show, hide]
 *           default: hide
 *     
 *     TopicResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         posted_by:
 *           type: string
 *         is_approved:
 *           type: integer
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         answer:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AnswerResponse'
 *     
 *     AnswerResponse:
 *       type: object
 *       properties:
 *         id:
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
 *     TopicListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TopicResponse'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
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