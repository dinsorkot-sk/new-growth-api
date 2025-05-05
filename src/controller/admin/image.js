const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Image , sequelize } = require('../../models');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'upload');
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  });
  const upload = multer({ storage }).array('image'); // รับหลายไฟล์ key = images
  
  // สร้างรูปภาพ
  exports.createImages = async (req, res) => {
    console.log('📦 Files received:', req.files);
  
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }
  
    const t = await sequelize.transaction();
    try {
      const savedImages = [];
  
      for (const file of req.files) {
        const imagePath = path.join('upload', path.basename(file.path)).replace(/\\/g, '/');
        console.log('📁 Saving image:', imagePath);
  
        const img = await Image.create({
          ref_type: 'gallery',
          image_path: imagePath,
          created_at: new Date(),
          updated_at: new Date()
        }, { transaction: t });
  
        savedImages.push(img);
      }
  
      await t.commit();
      res.status(201).json({ message: 'Images uploaded', Image: savedImages });
  
    } catch (err) {
      await t.rollback();
      console.error('❌ Error saving images:', err);
      res.status(500).json({ message: 'Failed to save images', error: err.message });
    }
  };
  

  exports.deleteImage = async (req, res) => {
    try {
      const { id } = req.params;
  
      // ตรวจสอบว่า id ที่ได้รับมามีอยู่ในฐานข้อมูลหรือไม่
      const image = await Image.findByPk(id);
  
      if (!image) {
        return res.status(404).json({
          message: 'ไม่พบรูปภาพที่ต้องการลบ'
        });
      }
  
      // ลบรูปภาพ
      await image.destroy();
  
      res.status(200).json({
        message: 'ลบรูปภาพสำเร็จ'
      });
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบรูปภาพ:', error);
      res.status(500).json({
        message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
        error: error.message
      });
    }
  };
  