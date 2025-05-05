const { Image } = require('../../models');
const { Op } = require('sequelize');


exports.getAllImages = async (req, res) => {
    try {
      let { offset = 0, limit = 10, search = '' } = req.query;
      const { ref_type } = req.params;
  
      offset = parseInt(offset);
      limit = parseInt(limit);
  
      const whereCondition = {};
  
      if (search) {
        whereCondition.image_path = {
          [Op.like]: `%${search}%`
        };
      }
  
      if (ref_type) {
        whereCondition.ref_type = ref_type;
      }
  
      const totalCount = await Image.count({ where: whereCondition });
  
      const images = await Image.findAll({
        where: whereCondition,
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
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงรูปภาพ:', error);
      res.status(500).json({
        message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
        error: error.message
      });
    }
  };
  