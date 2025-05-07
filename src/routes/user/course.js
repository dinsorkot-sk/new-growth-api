const express = require('express');
const router = express.Router();
const courseController = require("../../controller/user/course");


/**
 * @swagger
 * /api/course:
 *   get:
 *     tags: [User Course]
 *     summary: Get paginated course list
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
 *     responses:
 *       200:
 *         description: Paginated course list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Internal server error
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /api/course/{id}:
 *   get:
 *     tags: [User Course]
 *     summary: Get course by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', courseController.getCourseById); 

/**
 * @swagger
 * /api/course/view/{id}:
 *   put:
 *     tags: [User Course]
 *     summary: Update news view count
 *     description: อัปเดตจำนวนการเข้าดูข่าว
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID ของข่าว
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - view_count
 *             properties:
 *               view_count:
 *                 type: integer
 *                 example: 100
 *                 description: จำนวนการเข้าดูใหม่
 *     responses:
 *       200:
 *         description: อัปเดตจำนวนการเข้าดูสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course updated"
 *                 data:
 *                   $ref: '#/components/schemas/CourseResponse'
 *       404:
 *         description: ไม่พบข่าว
 *         content:
 *           application/json:
 *             example:
 *               message: "Course not found"
 *       500:
 *         description: เกิดข้อผิดพลาดบนเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             example:
 *               message: "Error updating news"
 *               error: "Error message details"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CourseResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         published_date:
 *           type: string
 *           format: date-time
 *         short_description:
 *           type: string
 *         view_count:
 *           type: integer
 *           description: จำนวนการเข้าดู (เพิ่มเข้าใหม่)
 *         image:
 *           $ref: '#/components/schemas/Image'
 *         tagAssignments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TagAssignment'
 */
router.put('/view/:id', courseController.updateView)



module.exports = router