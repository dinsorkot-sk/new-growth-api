const { Image } = require('../../models');
const { Op } = require('sequelize');


exports.getAllImages = async (req, res) => {
    try {
      let { offset = 0, limit = 10, search = '' } = req.query;
  
      offset = parseInt(offset);
      limit = parseInt(limit);
  
      const whereCondition = {};
  
      // ถ้ามีการค้นหา
      if (search) {
        whereCondition.image_path = {
          [Op.like]: `%${search}%`
        };
      }
  
      const totalCount = await Image.count({ where: whereCondition });
  
      const images = await Image.findAll({
        where: whereCondition,
        order: [['created_at', 'DESC']], // ล่าสุดขึ้นก่อน
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
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงรูปภาพ:', error);
      res.status(500).json({
        message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
        error: error.message
      });
    }
  };