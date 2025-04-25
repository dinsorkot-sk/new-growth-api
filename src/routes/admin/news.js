const express = require('express')
const router = express.Router();
const newsController = require("../../controller/admin/news")
const upload = require("../../config/multer")


//เพิ่มรูปและข่าวสาร
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