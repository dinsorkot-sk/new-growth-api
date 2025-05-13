const express = require('express');
const router = express.Router();
const controller = require('../../controller/admin/admission');

/**
 * @swagger
 * tags:
 *   name: Admin Admission
 *   description: Admission period management endpoints for admin
 */

/**
 * @swagger
 * /api/admin/adminssion:
 *   get:
 *     tags: [Admin Admission]
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
 *   post:
 *     tags: [Admin Admission]
 *     summary: Create a new admission period
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdmissionRequest'
 *     responses:
 *       201:
 *         description: Admission period created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdmissionResponse'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.get('/', controller.getAll);
router.post('/', controller.create);

/**
 * @swagger
 * /api/admin/adminssion/{id}:
 *   put:
 *     tags: [Admin Admission]
 *     summary: Update an admission period
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
 *             $ref: '#/components/schemas/AdmissionRequest'
 *     responses:
 *       200:
 *         description: Admission period updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdmissionResponse'
 *       404:
 *         description: Admission period not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags: [Admin Admission]
 *     summary: Delete an admission period
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Admission period deleted
 *       404:
 *         description: Admission period not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

/**
 * @swagger
 * components:
 *   schemas:
 *     AdmissionRequest:
 *       type: object
 *       required:
 *         - title
 *         - startDate
 *         - endDate
 *       properties:
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
 */

module.exports = router;