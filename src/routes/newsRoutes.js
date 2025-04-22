const express = require('express')
const router = express.Router();
const newsController = require("../controller/newsController")
const upload = require("../config/multer")


//เพิ่มรูปและข่าวสาร
router.post('/news',upload.single('image'), newsController.createNews)

//ดึงข้อมูลข่าวทั้งหมดที่มีสถานะ show
router.get('/news',newsController.getAllNews)

//ดีงแบบใช้ไอดี
router.get('/news/:id',newsController.getNewsById)


//ลบ
router.delete('/news/:id',newsController.deleteNews)

//อัปเดตข่าว
router.put('/news/:id',upload.single('image'),newsController.updateNews)

module.exports = router;