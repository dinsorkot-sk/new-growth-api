const multer = require('multer');
const path = require('path');

// ตั้งค่า storage สำหรับ video โดยเฉพาะ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'video');
},
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const uploadVideo = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

module.exports = uploadVideo;
