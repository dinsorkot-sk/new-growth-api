const { Image, Resource, ResourceFile } = require('../../models');
const { Op } = require('sequelize');
const path = require('path');


exports.getAllImages = async (req, res) => {
  try {
    let { offset = 0, limit = 10, search = '' } = req.query;
    const { ref_type } = req.params;

    offset = parseInt(offset);
    limit = parseInt(limit);

    if (ref_type === 'vibe') {
      // ดึงรูปภาพที่ ref_type = 'vibe'
      const imageCount = await Image.count();
      const images = await Image.findAll({
        order: [['created_at', 'DESC']],
        offset,
        limit
      });

      // ดึงวิดีโอ (Resource ที่ type = 'Video')
      const videoWhere = {
        type: 'video',
        status: 'show',
        deleted_at: null,
        title: { [Op.like]: `%${search}%` },
      };
      const videoCount = await Resource.count({ where: videoWhere });
      const videos = await Resource.findAll({
        where: videoWhere,
        include: [
          {
            model: ResourceFile,
            as: 'files',
            required: false,
            attributes: ['id', 'file_path', 'file_type', 'is_downloadable']
          }
        ],
        order: [['created_at', 'DESC']],
        offset,
        limit
      });

      return res.status(200).json({
        images,
        videos,
        pagination: {
          images: { total: imageCount, offset, limit },
          videos: { total: videoCount, offset, limit }
        }
      });
    } else {
      // กรณี ref_type อื่น ๆ (เหมือนเดิม)
      const where = {
        deleted_at: null,
        [Op.or]: [
          { ref_type: { [Op.like]: `%${ref_type}%` } },
        ]
      };

      const totalCount = await Image.count({ where });
      const images = await Image.findAll({
        where,
        order: [['created_at', 'DESC']],
        offset,
        limit
      });

      res.status(200).json({
        total: totalCount,
        images,
        pagination: {
          offset,
          limit
        }
      });
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงรูปภาพ:', error);
    res.status(500).json({
      message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
      error: error.message
    });
  }
};

exports.createImage = async (req, res) => {
  try {
    const { ref_type, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imagePath = path.join('upload', path.basename(req.file.path)).replace(/\\/g, '/');
    const img = await Image.create({
      ref_type,
      image_path: imagePath,
      description,
      created_at: new Date(),
      updated_at: new Date()
    });
    res.status(201).json({ message: 'Image uploaded', image: img });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์', error: error.message });
  }
};

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
