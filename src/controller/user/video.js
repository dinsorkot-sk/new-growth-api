const { Op } = require('sequelize');
const { Resource, ResourceFile } = require('../../models');
const path = require('path')
const fs = require('fs')


//getall
exports.getAllVideoResource = async (req, res) => {
    try {
      let { offset = 0, limit = 10, search = '' } = req.query;
  
      offset = parseInt(offset);
      limit = parseInt(limit);
  
      const whereCondition = {
        type: 'Video',
      };
  
      if (search) {
        whereCondition.title = { [Op.like]: `%${search}%` };
      }
  
      const totalCount = await Resource.count({ where: whereCondition });
  
      const videos = await Resource.findAll({
        where: whereCondition,
        include: [
          {
            model: ResourceFile,
            as: 'files',
            where: { is_downloadable: true }, 
            required: false, 
            attributes: ['id', 'file_path', 'file_type', 'is_downloadable']
          }
        ],
        order: [['created_at', 'DESC']],
        offset,
        limit
      });
  
      res.status(200).json({
        data: videos,
        pagination: {
          total: totalCount,
          offset,
          limit,
        },
      });
  
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลวิดีโอ:', error);
      res.status(500).json({ 
        error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
        details: error.message,
        stack: error.stack,
      });
    }
  };


  //getbyid

  exports.getVideoById = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Resource.findOne({
            where: { 
                id,
                type: 'Video',
                deleted_at: null // เผื่อมี soft delete
            },
            include: [
                {
                    model: ResourceFile,
                    as: 'files',
                    where: { is_downloadable: true },
                    required: false // ให้ยังได้ถ้าไม่มีไฟล์
                }
            ]
        });

        if (!video) {
            return res.status(404).json({ error: 'ไม่พบวิดีโอที่ต้องการ' });
        }

        res.status(200).json({
            message: 'ดึงข้อมูลวิดีโอเรียบร้อย',
            video
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงวิดีโอ:', error);
        res.status(500).json({ 
            error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์', 
            details: error.message
        });
    }
};



//download
exports.downloadVideo = async (req, res) => {
    try {
      const { id } = req.params;
  
      const resource = await Resource.findByPk(id, {
        include: [{
          model: ResourceFile,
          as: 'files',
          where: { is_downloadable: true }
        }]
      });
  
      if (!resource || !resource.files || resource.files.length === 0) {
        return res.status(404).json({ error: 'ไม่พบวิดีโอที่ดาวน์โหลดได้' });
      }
  
      const resourceFile = resource.files[0];
  
      if (!resourceFile.file_path) {
        return res.status(404).json({ error: 'ไม่พบพาธไฟล์วิดีโอ' });
      }
  
      const filePath = path.resolve(__dirname, '../../../', resourceFile.file_path);
  
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'ไฟล์วิดีโอไม่พบในระบบ' });
      }
  
      res.download(filePath);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดาวน์โหลดวิดีโอ:', error);
      res.status(500).json({
        error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
        details: error.message,
      });
    }
  };