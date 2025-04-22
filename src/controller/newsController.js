const { DATE } = require('sequelize');
const {News , Image} = require('../models');
const e = require('express');
const path = require('path')
const fs = require('fs');

//post
exports.createNews = async (req , res) =>{
    try {
        const { title, content, published_date, status } = req.body;
        let img_id = null;

        if(req.file){
            const image = await Image.create({
                ref_type: 'news',
                image_path: req.file.path,
                created_at: new Date(),
                updated_at: new Date()
            });

            img_id = image.id;
        }

        const news = await News.create({
            title,
            content,
            published_date,
            status,
            img_id,
            created_at: new Date(),
            updated_at: new Date()

            
        })

        res.status(201).json({message: "News created suscessfully", data : news})
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Error creating news", error})
        
    }
}

//getall
exports.getAllNews = async function (req, res) {
    try {
      const offset = parseInt(req.query.offset) || 0;
      const limit = parseInt(req.query.limit) || 10;
  
      const newsList = await News.findAll({
        where: {
          status: 'show',
          deleted_at: null
        },
        include: [
          {
            model: Image,
            as: 'image',
            required: false
          }
        ],
        offset: offset,
        limit: limit,
        order: [['created_at', 'DESC']]
      });
  
      res.status(200).json(newsList);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }; 


  //get by id
  exports.getNewsById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const news = await News.findOne({
        where: {
          id: id,
          status: 'show'
        },
        include: [
          {
            model: Image,
            as: 'image'
          }
        ]
      });
  
      if (!news) {
        return res.status(404).json({ message: 'News not found or not visible' });
      }
  
      res.json(news);
    } catch (error) {
      console.error('Error fetching news by id:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  //delete
  exports.deleteNews = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedCount = await News.destroy({
        where: { id }
      });
  
      if (deletedCount === 0) {
        return res.status(404).json({ message: 'News not found' });
      }
  
      res.json({ message: 'News deleted successfully' });
    } catch (error) {
      console.error('Error deleting news:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }; 


  //update 

  exports.updateNews = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, published_date, status } = req.body;
  
      const news = await News.findByPk(id);
      if (!news) {
        return res.status(404).json({ message: 'News not found' });
      }
  
      // อัปเดตเฉพาะฟิลด์ที่ส่งมา
      if (title !== undefined) news.title = title;
      if (content !== undefined) news.content = content;
      if (published_date !== undefined) news.published_date = published_date;
      if (status !== undefined) news.status = status;
  
      // หากมีไฟล์รูปใหม่
      if (req.file) {
        // ลบรูปเก่า (optional)
        if (news.img_id) {
          const oldImage = await Image.findByPk(news.img_id);
          if (oldImage) {
            const oldPath = path.join(__dirname, '..', 'upload', oldImage.image_path);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            await oldImage.destroy(); // ลบ record เก่าทิ้ง
          }
        }
  
        // เพิ่มรูปใหม่
        const newImage = await Image.create({
          image_path: req.file.filename,
          ref_id: id,
          ref_type: 'news',
        });
  
        news.img_id = newImage.id;
      }
  
      await news.save();
  
      res.json({ message: 'News updated successfully', news });
    } catch (error) {
      console.error('Error updating news:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

