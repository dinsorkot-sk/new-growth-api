const express = require('express');
const router = express.Router();
const eventController = require('../../controller/user/event');
const upload = require('../../config/multer');

/**
 * @swagger
 * tags:
 *   name: User Events
 *   description: Event management endpoints
 */

/**
 * @swagger
 * /api/event:
 *   get:
 *     tags: [User Events]
 *     summary: Get all events
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventResponse'
 *       500:
 *         description: Internal Server Error
 */
router.get('/', eventController.getAllEvents);

/**
 * @swagger
 * /api/event/{id}:
 *   get:
 *     tags: [User Events]
 *     summary: Get event by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', eventController.getEventById);

/**
 * @swagger
 * components:
 *   schemas:
 *     EventResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         event_date:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [show, hide]
 *         image:
 *           $ref: '#/components/schemas/Image'
 *         tagAssignments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TagAssignment'
 *     Image:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         image_path:
 *           type: string
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *     TagAssignment:
 *       type: object
 *       properties:
 *         tag:
 *           $ref: '#/components/schemas/Tag'
 */

module.exports = router;