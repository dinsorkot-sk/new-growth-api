const { Op } = require('sequelize');
const { sequelize, News, Image, Tag, TagAssignment } = require('../../models');
const path = require('path');
const fs = require('fs');

// ---------- Helper Functions ---------- //
const saveImage = async (file, t) => {
  return await Image.create({
    ref_type: 'news',
    image_path: file.path,
    created_at: new Date(),
    updated_at: new Date()
  }, { transaction: t });
};

const removeImage = async (imageId, t) => {
  const img = await Image.findByPk(imageId);
  if (img) {
    const imgPath = path.join(__dirname, '..', 'upload', img.image_path);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    await img.destroy({ transaction: t });
  }
};

const handleTags = async (tags, newsId, t) => {
  const newTags = Array.isArray(tags) ? tags : JSON.parse(tags);
  const existing = await TagAssignment.findAll({
    where: { taggable_id: newsId, taggable_type: 'news' },
    include: [{ model: Tag, as: 'tag' }],
    transaction: t
  });

  const existingMap = new Map();
  for (const a of existing) if (a.tag) existingMap.set(a.tag.name, a);

  for (const [name, a] of existingMap) {
    if (!newTags.includes(name)) await a.destroy({ transaction: t });
  }

  for (const name of newTags) {
    if (!existingMap.has(name)) {
      const [tag] = await Tag.findOrCreate({
        where: { name },
        defaults: { created_at: new Date(), updated_at: new Date() },
        transaction: t
      });

      await TagAssignment.create({
        tag_id: tag.id,
        taggable_id: newsId,
        taggable_type: 'news',
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });
    }
  }
};

exports.createNews = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, content, published_date, status, tag } = req.body;
    let img = req.file ? await saveImage(req.file, t) : null;

    const news = await News.create({
      title, content, published_date, status,
      img_id: img?.id,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction: t });

    if (tag) await handleTags(tag, news.id, t);

    const fullNews = await News.findByPk(news.id, {
      attributes: ['id', 'title', 'content', 'published_date'],
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['id', 'image_path']
        },
        {
          model: TagAssignment,
          as: 'tagAssignments',
          required: false,
          where: { taggable_type: 'news' },
          include: [{
            model: Tag,
            as: 'tag',
            attributes: ['id', 'name'],
          }]
        }
      ],
      transaction: t
    });

    const result = {
      ...fullNews.toJSON(),
      image: fullNews.image ? { id: fullNews.image.id, path: fullNews.image.image_path } : null,
      tags: fullNews.tagAssignments.map(ta => ta.tag)
    };

    await t.commit();
    res.status(201).json({ message: 'News created', data: result });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error creating news', error: err.message });
  }
};

exports.updateNews = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { title, content, published_date, status, tag } = req.body;

    const news = await News.findByPk(id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    Object.assign(news, { title, content, published_date, status });

    if (req.file) {
      await removeImage(news.img_id, t);
      const newImg = await saveImage(req.file, t);
      news.img_id = newImg.id;
    }

    await news.save({ transaction: t });
    if (tag) await handleTags(tag, news.id, t);

    await t.commit();
    res.json({ message: 'News updated', data: news });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error updating news', error: err.message });
  }
};

exports.deleteNews = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    await removeImage(news.img_id, t);
    await TagAssignment.destroy({ where: { taggable_id: id, taggable_type: 'news' }, transaction: t });
    await news.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'News deleted' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error deleting news', error: err.message });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const { offset = 0, limit = 10, search = '' } = req.query;
    const where = {
      status: 'show',
      deleted_at: null,
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ]
    };

    const newsList = await News.findAll({
      attributes: ['id', 'title', 'content', 'published_date'],
      where,
      offset: +offset,
      limit: +limit,
      order: [['published_date', 'DESC']],
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['id', 'image_path'],
          required: false
        },
        {
          model: TagAssignment,
          as: 'tagAssignments',
          required: false,
          where: { taggable_type: 'news' },
          include: [{ 
            model: Tag, 
            as: 'tag', 
            attributes: ['id', 'name'], 
          }]
        }
      ]
    });

    const result = newsList.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      published_date: n.published_date,
      image: n.image ? { id: n.image.id, path: n.image.image_path } : null,
      tags: n.tagAssignments.map(ta => ({ id: ta.tag?.id, name: ta.tag?.name }))
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findOne({
      where: { id: req.params.id, status: 'show' },
      include: [{ model: Image, as: 'image' }]
    });

    if (!news) return res.status(404).json({ message: 'News not found or not visible' });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
};
