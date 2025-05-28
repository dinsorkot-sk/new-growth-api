const { Op } = require('sequelize');
const { sequelize, News, Image, Tag, TagAssignment, Resource ,ResourceFile } = require('../../models');
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

const generatePaginationLinks = (req, offset, limit, totalCount, search = '') => {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);

  const prevOffset = offset - limit;
  const nextOffset = offset + limit;

  const prev = currentPage > 1
    ? `${baseUrl}?offset=${prevOffset}&limit=${limit}&search=${encodeURIComponent(search)}`
    : null;

  const next = currentPage < totalPages
    ? `${baseUrl}?offset=${nextOffset}&limit=${limit}&search=${encodeURIComponent(search)}`
    : null;

  return {
    totalCount,
    currentPage,
    totalPages,
    prev,
    next
  };
};

// ---------- Controllers ---------- //
exports.getAllNews = async (req, res) => {
  try {
    const { offset = 0, limit = 10, search = '' } = req.query;
    const parsedOffset = parseInt(offset);
    const parsedLimit = parseInt(limit);
    const where = {
      status: 'show',
      deleted_at: null,
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ]
    };

    const totalCount = await News.count({ where });

    const newsList = await News.findAll({
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
          model: Image,
          as: 'images',
          attributes: ['id', 'image_path', 'description'],
          separate: true,
          order: [['id', 'ASC']]
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
      ...n.toJSON(),
    }));

    const pagination = generatePaginationLinks(req, parsedOffset, parsedLimit, totalCount, search);

    res.status(200).json({
      data: result,
      pagination
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findOne({
      where: { id: req.params.id, status: 'show' },
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['id', 'image_path']
        },
        {
          model: Image,
          as: 'images',
          attributes: ['id', 'image_path', 'description'],
          separate: true,
          order: [['id', 'ASC']]
        },
        {
          model: Resource,
          as: 'resources',
          include: [
            { model: ResourceFile, as: 'files' }
          ]
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
    });

    if (!news) return res.status(404).json({ message: 'News not found or not visible' });
    const result = {
      ...news.toJSON(),
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
};


exports.updateView = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params
    const { view_count } = req.body

    const news = await News.findByPk(id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    Object.assign(news, { view_count });

    await news.save({ transaction: t });

    const fullNews = await News.findByPk(news.id, {
      attributes: ['id', 'title', 'content', 'published_date', 'short_description', 'view_count'],
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['id', 'image_path']
        },
        {
          model: Image,
          as: 'images',
          attributes: ['id', 'image_path', 'description'],
          separate: true,
          order: [['id', 'ASC']]
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
    };

    await t.commit();
    res.json({ message: 'News updated', data: result });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error updating news', error: err.message });
  }
}