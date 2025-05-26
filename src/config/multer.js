const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = ['.mp4', '.mov', '.avi', '.wmv', '.mkv', '.webm'].includes(ext);
    if (isVideo) {
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
  storage
});

module.exports = upload;
