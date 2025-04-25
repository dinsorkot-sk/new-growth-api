const { Op } = require('sequelize');
const { sequelize, News, Image, Tag, TagAssignment } = require('../models');
const e = require('express');
const path = require('path')
const fs = require('fs');

//----------------------------------------Admin----------------------------------------------------------------//

exports.createNews = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { title, content, published_date, status } = req.body;
    let img_id = null;

    // จัดการรูปภาพ
    if (req.file) {
      const image = await Image.create({
        ref_type: 'news',
        image_path: req.file.path,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });

      img_id = image.id;
    }

    // สร้างข่าว
    const news = await News.create({
      title,
      content,
      published_date,
      status,
      img_id,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction: t });

    // จัดการ tag
    if (req.body.tag) {
      let tags = [];

      try {
        tags = JSON.parse(req.body.tag);
      } catch (e) {
        await t.rollback();
        return res.status(400).json({ message: "รูปแบบ tag ไม่ถูกต้อง (ต้องเป็น JSON array)" });
      }

      for (const tagName of tags) {
        const [tag] = await Tag.findOrCreate({
          where: { name: tagName },
          defaults: {
            created_at: new Date(),
            updated_at: new Date()
          },
          transaction: t
        });

        await TagAssignment.create({
          tag_id: tag.id,
          taggable_id: news.id,
          taggable_type: 'news',
          created_at: new Date(),
          updated_at: new Date()
        }, { transaction: t });
      }
    }

    await t.commit();
    return res.status(201).json({ message: "News created successfully", data: news });

  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(500).json({ message: "Error creating news", error: error.message });
  }
};

exports.deleteNews = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    // ตรวจสอบข่าวที่จะแก้ไข
    const news = await News.findByPk(id);
    if (!news) {
      await t.rollback();
      return res.status(404).json({ message: "News not found" });
    }

    // ลบรูปภาพที่เกี่ยวข้องกับข่าว
    if (news.img_id) {
      const oldImage = await Image.findByPk(news.img_id);
      if (oldImage) {
        const oldPath = path.join(__dirname, '..', 'upload', oldImage.image_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        await oldImage.destroy({ transaction: t }); // ลบภาพจากฐานข้อมูล
      }
    }

    // ลบข่าวจากฐานข้อมูล
    await news.destroy({ transaction: t });

    // ลบ tag assignments ที่เกี่ยวข้องกับข่าว
    await TagAssignment.destroy({
      where: {
        taggable_id: id,
        taggable_type: 'news'
      },
      transaction: t
    });

    await t.commit();
    return res.json({ message: "News deleted successfully" });

  } catch (error) {
    await t.rollback();
    console.error("🔥 Error deleting news:", error);
    return res.status(500).json({ message: "Error deleting news", error: error.message });
  }
};



//update 

exports.updateNews = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { title, content, published_date, status } = req.body;

    // ตรวจสอบข่าวที่จะแก้ไข
    const news = await News.findByPk(id);
    if (!news) {
      await t.rollback();
      return res.status(404).json({ message: "News not found" });
    }

    // อัปเดตฟิลด์ข่าว
    if (title !== undefined) news.title = title;
    if (content !== undefined) news.content = content;
    if (published_date !== undefined) news.published_date = published_date;
    if (status !== undefined) news.status = status;

    // อัปเดตรูปภาพ
    if (req.file) {
      if (news.img_id) {
        const oldImage = await Image.findByPk(news.img_id);
        if (oldImage) {
          const oldPath = path.join(__dirname, '..', 'upload', oldImage.image_path);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          await oldImage.destroy({ transaction: t });
        }
      }

      const image = await Image.create({
        ref_type: 'news',
        image_path: req.file.path,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });

      news.img_id = image.id;
    }

    // เซฟข่าวหลังจากอัปเดต
    await news.save({ transaction: t });

    // อัปเดต tag
    if (req.body.tag) {
      let newTags = [];

      // รองรับทั้ง array และ stringified JSON
      if (Array.isArray(req.body.tag)) {
        newTags = req.body.tag;
      } else {
        try {
          newTags = JSON.parse(req.body.tag);
        } catch (e) {
          await t.rollback();
          return res.status(400).json({ message: "รูปแบบ tag ไม่ถูกต้อง (ต้องเป็น JSON array)" });
        }
      }

      console.log("🟢 newTags:", newTags);

      // ดึง tag assignment เดิม
      const existingAssignments = await TagAssignment.findAll({
        where: {
          taggable_id: id,
          taggable_type: 'news'
        },
        include: [{ model: Tag, as: 'tag' }],
        transaction: t
      });

      const existingTagMap = new Map();
      for (const assignment of existingAssignments) {
        if (assignment.tag) {
          existingTagMap.set(assignment.tag.name, assignment);
        }
      }

      // ลบ tag ที่ไม่มีใน newTags
      for (const [name, assignment] of existingTagMap.entries()) {
        if (!newTags.includes(name)) {
          console.log('❌ Removing tag:', name);
          await assignment.destroy({ transaction: t });
        }
      }

      // เพิ่ม tag ใหม่
      for (const tagName of newTags) {
        if (!existingTagMap.has(tagName)) {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName },
            defaults: {
              created_at: new Date(),
              updated_at: new Date()
            },
            transaction: t
          });

          console.log('➕ Adding tag:', tagName);

          await TagAssignment.create({
            tag_id: tag.id,
            taggable_id: id,
            taggable_type: 'news',
            created_at: new Date(),
            updated_at: new Date()
          }, { transaction: t });
        }
      }
    }

    await t.commit();
    return res.json({ message: "News updated successfully", data: news });

  } catch (error) {
    await t.rollback();
    console.error("🔥 Error updating news:", error);
    return res.status(500).json({ message: "Error updating news", error: error.message });
  }
};

//-----------------------------------------------------------------------------------------------------------//


//----------------------------------------User----------------------------------------------------------------//


//getall



exports.getAllNews = async (req, res) => {
  try {
    const { offset = 0, limit = 10, search = '' } = req.query;

    const whereConditions = {
      [Op.or]: [
        { status: 'show', deleted_at: null },
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ]
    };

    const newsList = await News.findAll({
      attributes: ['id', 'title', 'content', 'published_date'],
      include: [
        {
          model: TagAssignment,
          as: 'tagAssignments',
          required: false,
          where: {
            taggable_type: 'news'
          },
          include: [
            {
              model: Tag,
              as: 'tag',
              attributes: ['id', 'name'],
              where: search ? { name: { [Op.like]: `%${search}%` } } : undefined
            }
          ]
        },
        {
          model: Image,
          as: 'image',
          attributes: ['id', 'image_path'],
          where: search ? { image_path: { [Op.like]: `%${search}%` } } : undefined,
          required: false
        }
      ],
      where: whereConditions,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['published_date', 'DESC']],
      logging: console.log
    });


    const result = newsList
      .filter(news => {
        if (!search) return true;
        const inTags = news.tagAssignments.some(ta =>
          ta.tag?.name?.includes(search)
        );
        return inTags || true;
      })
      .map(news => ({
        id: news.id,
        title: news.title,
        content: news.content,
        published_date: news.published_date,
        image: news.image
          ? {
            id: news.image.id,
            path: news.image.image_path
          }
          : null,
        tags: news.tagAssignments.map(ta => ({
          id: ta.tag ? ta.tag.id : null,
          name: ta.tag ? ta.tag.name : null
        }))
      }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching news with tags:', error);
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


