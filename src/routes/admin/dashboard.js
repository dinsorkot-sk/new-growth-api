// src/routes/admin/dashboard.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../../controller/admin/dashboard');

/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: Dashboard summary and analytics
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin Dashboard]
 *     summary: Get dashboard data summary
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 visitorCount:
 *                   type: integer
 *                 courseCount:
 *                   type: integer
 *                 newMessages:
 *                   type: integer
 *                 todayActivities:
 *                   type: integer
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       students:
 *                         type: integer
 *                 latestMessages:
 *                   type: array
 *                   items:
 *                     type: object
 *                 latestActivities:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.get('/', dashboardController.getDashboardData);

module.exports = router;
