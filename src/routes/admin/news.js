const express = require('express')
const router = express.Router();
const newsController = require("../../controller/admin/news")
const upload = require("../../config/multer")


//เพิ่มรูปและข่าวสาร
/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               event_date:
 *                 type: string
 *                 format: date
 *               tag:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post('/',upload.single('image'), newsController.createNews)

//ดึงข้อมูลข่าวทั้งหมดที่มีสถานะ show
router.get('/',newsController.getAllNews)

//ดีงแบบใช้ไอดี
router.get('/:id',newsController.getNewsById)

//ลบ
router.delete('/:id',newsController.deleteNews)

//อัปเดตข่าว
router.put('/:id',upload.single('image'),newsController.updateNews)
module.exports = router;