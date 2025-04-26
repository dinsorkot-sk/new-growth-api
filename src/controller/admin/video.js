const path = require('path');
const multer = require('multer');
const {Resource , ResourceType } = require('../../models')

const storage = multer.diskStorage({
    destination: function (req, file , cb){
        cb(null,'video');
    },
    filename: function(req,file,cb){
        const uniqueSuffix = Date.now()+ '-' + Math.round(Math.random()*1E9);
        const ext = path.extname(file.originalname);
        cb(null,file.fieldname + '-' + uniqueSuffix + ext)
    }
});

const upload = multer({storage : storage});

exports.uploadVideo = upload.single('video_file') 


exports.createVideo = async (req, res) => {
    try {
        const { title, description, duration, author,status, published_date } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'กรุณาอัปโหลดไฟล์วิดีโอ' });
        }

        const videoPath = req.file.path;

        const videoType = await ResourceType.findOne({ where: { name: 'Video' } });

        if (!videoType) {
            return res.status(400).json({ error: 'ไม่พบประเภท Video ในระบบ' });
        }

        const newVideo = await Resource.create({
            title,
            description,
            type_id: videoType.id, // <= ต้องใช้ type_id แทน
            duration,
            author,
            status,
            published_date: published_date || new Date(),
            file_path: videoPath
        });

        res.status(201).json({
            message: 'สร้างวิดีโอเรียบร้อย',
            video: newVideo
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างวิดีโอ:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
}; 



