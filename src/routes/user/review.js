// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../../controller/user/review');

/**
 * @swagger
 * tags:
 *   name: Course Reviews
 *   description: Course review management endpoints
 */

/**
 * @swagger
 * /api/review:
 *   post:
 *     tags: [Course Reviews]
 *     summary: สร้างรีวิวคอร์สใหม่
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewRequest'
 *     responses:
 *       201:
 *         description: สร้างรีวิวสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
 *       400:
 *         description: ข้อมูลไม่ครบถ้วน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: ไม่พบคอร์ส
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: ข้อผิดพลาดเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', reviewController.createReview);

/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewRequest:
 *       type: object
 *       required:
 *         - username
 *         - course_id
 *       properties:
 *         username:
 *           type: string
 *           example: john_doe
 *         score:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           example: 4.5
 *         comment:
 *           type: string
 *           example: คอร์สดีมากๆ
 *         course_id:
 *           type: integer
 *           example: 1
 * 
 *     ReviewResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: john_doe
 *         score:
 *           type: number
 *           example: 4.5
 *         comment:
 *           type: string
 *           example: คอร์สดีมากๆ
 *         course_id:
 *           type: integer
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2023-08-01T12:34:56Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2023-08-01T12:34:56Z
 *         course:
 *           $ref: '#/components/schemas/Course'
 * 
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: คอร์สพัฒนาเว็บขั้นเทพ
 *         description:
 *           type: string
 *           example: คอร์สเรียนพัฒนาเว็บแอปพลิเคชัน
 *         price:
 *           type: number
 *           example: 2990
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2023-07-01T09:00:00Z
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: เกิดข้อผิดพลาดบางอย่าง
 */

module.exports = router;