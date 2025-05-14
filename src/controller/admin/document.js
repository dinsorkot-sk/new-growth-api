const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Resource, ResourceFile } = require('../../models');

// ตั้งค่า storage สำหรับ document
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'documents');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
});

exports.uploadDocument = upload.single('document_file');

exports.createDocument = async (req, res) => {
  const t = await Resource.sequelize.transaction();
  try {
    const { title, description, author, status, published_date, is_downloadable, pages } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'กรุณาอัปโหลดไฟล์เอกสาร' });
    }

    const documentPath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const newResource = await Resource.create({
      title,
      description,
      type: 'Document',
      author,
      pages,
      status: status || 'show',
      published_date: published_date || new Date()
    }, { transaction: t });

    const resourceFile = await ResourceFile.create({
      resource_id: newResource.id,
      file_type: fileExtension,
      file_path: documentPath.replace(/\\/g, '/'),
      is_downloadable: is_downloadable === 'true' || is_downloadable === true
    }, { transaction: t });

    await t.commit(); // ✅ Commit เมื่อสำเร็จ

    res.status(201).json({
      message: 'สร้างเอกสารเรียบร้อย',
      resource: newResource,
      resourceFile: resourceFile
    });
  } catch (error) {
    await t.rollback(); // ❌ Rollback เมื่อมี error
    console.error('เกิดข้อผิดพลาดในการสร้างเอกสาร:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
};

// update
exports.updateDocument = upload.single('document_file'); // ใช้ multer middleware

exports.updateDocumentResource = async (req, res) => {
  const t = await Resource.sequelize.transaction();
  try {
    const { id } = req.params;
    const { title, description, author, status, published_date, is_downloadable, pages } = req.body;

    const resource = await Resource.findByPk(id, { transaction: t });
    if (!resource) {
      await t.rollback();
      return res.status(404).json({ error: 'ไม่พบทรัพยากรที่ต้องการอัพเดท' });
    }

    await resource.update({
      title: title || resource.title,
      description: description || resource.description,
      author: author || resource.author,
      pages: pages || resource.pages,
      status: status || resource.status,
      published_date: published_date || resource.published_date
    }, { transaction: t });

    let resourceFile = await ResourceFile.findOne({
      where: { resource_id: id },
      transaction: t
    });

    if (resourceFile && is_downloadable !== undefined) {
      await resourceFile.update({
        is_downloadable: is_downloadable === 'true' || is_downloadable === true
      }, { transaction: t });
    }

    if (req.file) {
      const documentPath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase().replace('.', '');

      if (resourceFile) {
        const oldFilePath = resourceFile.file_path;

        await resourceFile.update({
          file_type: fileExtension,
          file_path: documentPath.replace(/\\/g, '/'),
        }, { transaction: t });

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } else {
        resourceFile = await ResourceFile.create({
          resource_id: id,
          file_type: fileExtension,
          file_path: documentPath.replace(/\\/g, '/'),
          is_downloadable: is_downloadable === 'true' || is_downloadable === true
        }, { transaction: t });
      }
    }

    await t.commit();

    const updatedResource = await Resource.findByPk(id);
    const updatedResourceFile = await ResourceFile.findOne({ where: { resource_id: id } });

    res.status(200).json({
      message: 'อัพเดทเอกสารเรียบร้อย',
      resource: updatedResource,
      resourceFile: updatedResourceFile
    });
  } catch (error) {
    await t.rollback();
    console.error('เกิดข้อผิดพลาดในการอัพเดทเอกสาร:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
      details: error.message
    });
  }
};


//delete
exports.deleteDocument = async (req, res) => {
  const t = await Resource.sequelize.transaction();
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id, { transaction: t });
    if (!resource) {
      await t.rollback();
      return res.status(404).json({ error: 'ไม่พบทรัพยากรที่ต้องการลบ' });
    }

    const resourceFile = await ResourceFile.findOne({
      where: { resource_id: id },
      transaction: t
    });

    if (resourceFile && resourceFile.file_path && fs.existsSync(resourceFile.file_path)) {
      fs.unlinkSync(resourceFile.file_path);
      await resourceFile.destroy({ transaction: t });
    }

    await resource.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({ message: 'ลบเอกสารเรียบร้อย' });
  } catch (error) {
    await t.rollback();
    console.error('เกิดข้อผิดพลาดในการลบเอกสาร:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
      details: error.message
    });
  }
};
