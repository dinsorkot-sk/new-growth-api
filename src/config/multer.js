const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'video') {
      cb(null, 'video');
    } else {
      cb(null, 'upload');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fieldSize: 10 * 1024 * 1024, // 10MB ต่อ field
    fileSize: 100 * 1024 * 1024, // 100MB ต่อไฟล์
    files: 10 // จำนวนไฟล์สูงสุดต่อ request
  }
});

module.exports = upload;
