const multer = require('multer');
const path = require('path');

// ตั้งค่า storage สำหรับ document โดยเฉพาะ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'documents'); // เปลี่ยนที่เก็บไฟล์เป็น folder documents
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only document files are allowed!'), false);
  }
};

const uploadDocument = multer({ 
  storage: storage,
});

module.exports = uploadDocument;
