const express = require('express');
const router = express.Router();
const eventController = require('../../controller/admin/event');
const upload = require('../../config/multer');

/**
 * @swagger
 * tags:
 *   name: Admin Events
 *   description: Event management endpoints
 */

/**
 * @swagger
 * /api/admin/event:
 *   post:
 *     tags: [Admin Events]
 *     summary: Create a new event
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               event_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [show, hide]
 *                 default: show
 *               tag:
 *                 type: string
 *                 description: JSON array of tags (e.g., ["tag1","tag2"])
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       500:
 *         description: Internal Server Error
 */
router.post('/', upload.single('image'), eventController.createEvent);

/**
 * @swagger
 * /api/admin/event:
 *   get:
 *     tags: [Admin Events]
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
 * /api/admin/event/{id}:
 *   get:
 *     tags: [Admin Events]
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
 * /api/admin/event/{id}:
 *   put:
 *     tags: [Admin Events]
 *     summary: Update an event
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               event_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [show, hide]
 *               tag:
 *                 type: string
 *                 description: JSON array of tags (e.g., ["tag1","tag2"])
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', upload.single('image'), eventController.updateEvent);

/**
 * @swagger
 * /api/admin/event/{id}:
 *   delete:
 *     tags: [Admin Events]
 *     summary: Delete an event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', eventController.deleteEvent);

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