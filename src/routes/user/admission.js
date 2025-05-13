const express = require('express');
const router = express.Router();
const controller = require('../../controller/user/admission');

/**
 * @swagger
 * tags:
 *   name: User Admission
 *   description: Admission period endpoints for users
 */

/**
 * @swagger
 * /api/admission:
 *   get:
 *     tags: [User Admission]
 *     summary: Get all admission periods
 *     responses:
 *       200:
 *         description: List of all admission periods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdmissionResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/admission/active:
 *   get:
 *     tags: [User Admission]
 *     summary: Get currently active admission period(s)
 *     description: Returns the admission period(s) that are currently active based on the current date.
 *     responses:
 *       200:
 *         description: List of active admission periods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdmissionResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/active', controller.getActive);

/**
 * @swagger
 * components:
 *   schemas:
 *     AdmissionResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         selectionStartDate:
 *           type: string
 *           format: date-time
 *         selectionEndDate:
 *           type: string
 *           format: date-time
 *         trainingStartDate:
 *           type: string
 *           format: date-time
 *         link_register:
 *           type: string
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