// src/routes/user/user.js

const express = require('express');
const router = express.Router();
const userController = require('../../controller/user/user');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/user:
 *   post:
 *     tags: [Users]
 *     summary: Create user login with IP
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */
router.post('/', userController.createUserLogin);

module.exports = router;
