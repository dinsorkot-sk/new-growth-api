const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Image, sequelize } = require('../../models');

// สร้างรูปภาพ
exports.createImages = async (req, res) => {
  console.log('📦 Files received:', req.files);

  // รับ description จาก body (รองรับหลายไฟล์: description เป็น array หรือ string)
  let descriptions = req.body.description || [];
  if (!Array.isArray(descriptions)) {
    descriptions = [descriptions];
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files were uploaded' });
  }

  const t = await sequelize.transaction();
  try {
    const savedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imagePath = path.join('upload', path.basename(file.path)).replace(/\\/g, '/');
      console.log('📁 Saving image:', imagePath);
      const description = descriptions[i] || null;

      const img = await Image.create({
        ref_type: 'board',
        image_path: imagePath,
        description,
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

exports.createMedia = async (req, res) => {
  console.log('📦 Files received:', req.files);

  // ถ้าใช้ upload.array('media') => req.files เป็น array
  // ถ้าใช้ upload.fields([{ name: 'media', maxCount: 10 }]) => req.files.media เป็น array
  const files = req.files.media || req.files; // รองรับทั้งสองแบบ

  let descriptions = req.body.description || [];
  if (!Array.isArray(descriptions)) {
    descriptions = [descriptions];
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files were uploaded' });
  }

  const t = await sequelize.transaction();
  try {
    const savedMedia = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.originalname).toLowerCase();
      const isVideo = ['.mp4', '.mov', '.avi', '.wmv', '.mkv', '.webm'].includes(ext);
      const mediaType = isVideo ? 'video' : 'image';
      // กำหนด path ให้ถูกต้องตามโฟลเดอร์
      const mediaPath = path.join(isVideo ? 'video' : 'upload', path.basename(file.path)).replace(/\\/g, '/');
      const description = descriptions[i] || null;

      const media = await Image.create({
        ref_type: 'board',
        image_path: mediaPath,
        description,
        type: mediaType,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });

      savedMedia.push(media);
    }

    await t.commit();
    res.status(201).json({ message: 'Media uploaded', media: savedMedia });

  } catch (err) {
    await t.rollback();
    console.error('❌ Error saving media:', err);
    res.status(500).json({ message: 'Failed to save media', error: err.message });
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

// อัปเดตรูปภาพ (เฉพาะ description หรือไฟล์ใหม่)
exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    let image = await Image.findByPk(id);
    if (!image) {
      return res.status(404).json({ message: 'ไม่พบรูปภาพที่ต้องการแก้ไข' });
    }
    let image_path = image.image_path;
    if (req.file) {
      image_path = path.join('upload', path.basename(req.file.path)).replace(/\\/g, '/');
    }
    await image.update({
      description: description || image.description,
      image_path,
      updated_at: new Date()
    });
    res.status(200).json({ message: 'อัปเดตรูปภาพสำเร็จ', image });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปเดตรูปภาพ:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์', error: error.message });
  }
};
