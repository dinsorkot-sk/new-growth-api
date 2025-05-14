const { Op } = require('sequelize');
const { Resource, ResourceFile } = require('../../models');
const path = require('path')
const fs = require('fs')
 

//get all
exports.getAllDocumentResource = async (req, res) => {
    try {
      let { offset = 0, limit = 10, search = '' } = req.query;
  
      offset = parseInt(offset);
      limit = parseInt(limit);
  
      const whereCondition = {
        type: 'Document',
      };
  
      if (search) {
        whereCondition.title = { [Op.like]: `%${search}%` };
      }
  
      const totalCount = await Resource.count({ where: whereCondition });
  
      const documents = await Resource.findAll({
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
        data: documents,
        pagination: {
          total: totalCount,
          offset,
          limit,
        },
      });
  
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเอกสาร:', error);
      res.status(500).json({ 
        error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
        details: error.message,
        stack: error.stack,
      });
    }
  }



//get by id
  exports.getDocumentResourceById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const document = await Resource.findOne({
        where: {
          id: id,
          type: 'Document'
        },
        include: [
          {
            model: ResourceFile,
            as: 'files',
            attributes: ['id', 'file_path', 'file_type', 'is_downloadable']
          }
        ]
      });
  
      if (!document) {
        return res.status(404).json({ error: 'ไม่พบเอกสารที่ต้องการค้นหา' });
      }
  
      res.status(200).json({
        data: document
      });
  
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเอกสาร:', error);
      res.status(500).json({ 
        error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
        details: error.message,
        stack: error.stack,
      });
    }
  }; 



  //download
  
exports.downloadDocument = async (req, res) => {
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
        return res.status(404).json({ error: 'ไม่พบเอกสารที่ดาวน์โหลดได้' });
      }
  
      const resourceFile = resource.files[0];
  
      if (!resourceFile.file_path) {
        return res.status(404).json({ error: 'ไม่พบพาธไฟล์เอกสาร' });
      }
  
      const filePath = path.resolve(__dirname, '../../../', resourceFile.file_path);
  
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'ไม่พบไฟล์เอกสารในระบบ' });
      }
  
      res.download(filePath);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร:', error);
      res.status(500).json({
        error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
        details: error.message,
      });
    }
  }; 


  //get document and Video file 
  exports.getAllDocumentAndVideo = async (req, res) => {
    try {
      let { offset = 0, limit = 10, search = '' , type = ''} = req.query;
  
      offset = parseInt(offset);
      limit = parseInt(limit);
  
      const whereCondition = {
        type: { [Op.in]: [type] },
        status: 'show'
      };
  
      if (search) {
        whereCondition.title = { [Op.like]: `%${search}%` };
      }
  
      const totalCount = await Resource.count({ where: whereCondition });
  
      const resources = await Resource.findAll({
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
        data: resources,
        pagination: {
          total: totalCount,
          offset,
          limit,
        },
      });
  
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเอกสารและวิดีโอ:', error);
      res.status(500).json({ 
        error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
        details: error.message,
        stack: error.stack,
      });
    }
  };