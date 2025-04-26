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
  limits: { fileSize: 50 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files are allowed!'), false);
    }
  }
});

exports.uploadDocument = upload.single('document_file'); 

exports.createDocument = async (req, res) => {
  try {
    const { title, description, author, status, published_date, is_downloadable , pages } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'กรุณาอัปโหลดไฟล์เอกสาร' });
    }

    const documentPath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    // สร้าง resource หลัก
    const newResource = await Resource.create({
      title,
      description,
      type: 'Document',
      author,
      pages,
      status: status || 'show',
      published_date: published_date || new Date()
    });

    // สร้าง resource_file ที่เชื่อมโยงกับ resource หลัก
    const resourceFile = await ResourceFile.create({
      resource_id: newResource.id,
      file_type: fileExtension,
      file_path: documentPath,
      is_downloadable: is_downloadable === 'true' || is_downloadable === true
    });

    res.status(201).json({
      message: 'สร้างเอกสารเรียบร้อย',
      resource: newResource,
      resourceFile: resourceFile
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างเอกสาร:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
};


// update

exports.updateDocument = upload.single('document_file'); // ใช้ multer middleware

exports.updateDocumentResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, author, status, published_date, is_downloadable, pages } = req.body;

    // ตรวจสอบว่ามี resource ที่ต้องการอัพเดทหรือไม่
    const resource = await Resource.findByPk(id);
    if (!resource) {
      return res.status(404).json({ error: 'ไม่พบทรัพยากรที่ต้องการอัพเดท' });
    }

    // อัพเดทข้อมูลใน Resource
    await resource.update({
      title: title || resource.title,
      description: description || resource.description,
      author: author || resource.author,
      pages: pages || resource.pages,
      status: status || resource.status,
      published_date: published_date || resource.published_date
    });

    // ค้นหา resource_file ที่เกี่ยวข้อง
    let resourceFile = await ResourceFile.findOne({
      where: { resource_id: id }
    });

    // อัพเดท is_downloadable ใน resourceFile ถ้ามีการส่งมา
    if (resourceFile && is_downloadable !== undefined) {
      await resourceFile.update({
        is_downloadable: is_downloadable === 'true' || is_downloadable === true
      });
    }

    // ถ้ามีการอัพโหลดไฟล์ใหม่
    if (req.file) {
      const documentPath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase().replace('.', '');

      if (resourceFile) {
        // อัพเดท resource_file ที่มีอยู่แล้ว
        // เก็บพาธไฟล์เดิมเพื่อลบออกหลังจากอัพเดทสำเร็จ
        const oldFilePath = resourceFile.file_path;

        await resourceFile.update({
          file_type: fileExtension,
          file_path: documentPath
        });

        // ลบไฟล์เก่าถ้ามีอยู่
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } else {
        // สร้าง resource_file ใหม่ถ้ายังไม่มี
        resourceFile = await ResourceFile.create({
          resource_id: id,
          file_type: fileExtension,
          file_path: documentPath,
          is_downloadable: is_downloadable === 'true' || is_downloadable === true
        });
      }
    }

    // ดึงข้อมูลที่อัพเดทแล้วเพื่อส่งกลับ
    const updatedResource = await Resource.findByPk(id);
    const updatedResourceFile = await ResourceFile.findOne({
      where: { resource_id: id }
    });

    res.status(200).json({
      message: 'อัพเดทเอกสารเรียบร้อย',
      resource: updatedResource,
      resourceFile: updatedResourceFile
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัพเดทเอกสาร:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
      details: error.message,
      stack: error.stack
    });
  }
}; 





//delete

exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ค้นหา resource ที่ต้องการลบ
        const resource = await Resource.findByPk(id);
        if (!resource) {
            return res.status(404).json({ error: 'ไม่พบทรัพยากรที่ต้องการลบ' });
        }
        
        // ค้นหา resource_file ที่เกี่ยวข้อง
        const resourceFile = await ResourceFile.findOne({
            where: { resource_id: id }
        });
        
        // ลบไฟล์จริงออกจากระบบ (ถ้ามี)
        if (resourceFile && resourceFile.file_path) {
            if (fs.existsSync(resourceFile.file_path)) {
                fs.unlinkSync(resourceFile.file_path);
            }
            
            // ลบข้อมูล resource_file จากฐานข้อมูล
            await resourceFile.destroy();
        }
        
        // ลบข้อมูล resource จากฐานข้อมูล
        await resource.destroy();
        
        res.status(200).json({
            message: 'ลบเอกสารเรียบร้อย'
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบเอกสาร:', error);
        res.status(500).json({ 
            error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์', 
            details: error.message 
        });
    }
};