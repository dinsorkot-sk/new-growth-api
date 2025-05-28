const { Op } = require('sequelize');
const { sequelize, News, Image, Tag, TagAssignment, Resource, ResourceFile } = require('../../models');
const path = require('path');
const fs = require('fs');

// ---------- Helper Functions ---------- //
const saveImages = async (files, descriptions = [], t) => {
  const images = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const desc = descriptions[i] || '';
    const imagePath = path.join('upload', path.basename(file.path));
    const img = await Image.create({
      ref_type: 'news',
      image_path: imagePath,
      description: desc,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction: t });
    images.push(img);
  }
  return images;
};

const removeImage = async (imageId, t) => {
  const img = await Image.findByPk(imageId);
  if (img) {
    const imgPath = path.join(__dirname, '..', 'upload', img.image_path);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    await img.destroy({ transaction: t });
  }
};

const handleVideos = async (files, newsId, descriptions = [], t) => {
  if (!files || !files.video) return [];
  const videoResources = [];
  for (let i = 0; i < files.video.length; i++) {
    const videoFile = files.video[i];
    const desc = descriptions[i] || '';
    const resource = await Resource.create({
      title: `Video for news ${newsId}`,
      description: desc,
      type: 'video',
      duration: null,
      author: 'System',
      status: 'show',
      published_date: new Date(),
      news_id: newsId,
    }, { transaction: t });
    const fileExtension = path.extname(videoFile.originalname).toLowerCase().replace('.', '');
    await ResourceFile.create({
      resource_id: resource.id,
      file_type: fileExtension,
      file_path: videoFile.path.replace(/\\/g, '/'),
      is_downloadable: false
    }, { transaction: t });
    videoResources.push(resource);
  }
  return videoResources;
};

const handleTags = async (tags, newsId, t) => {
  let newTags = [];

  if (Array.isArray(tags)) {
    newTags = tags;
  } else if (typeof tags === 'string') {
    try {
      newTags = JSON.parse(tags);
      if (!Array.isArray(newTags)) throw new Error(); // catch things like `{"tag": "name"}`
    } catch {
      newTags = tags.split(',').map(t => t.trim()).filter(Boolean); // fallback to comma-separated
    }
  }
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

function parseDescriptions(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  try {
    // พยายาม parse เป็น JSON ก่อน
    const arr = JSON.parse(input);
    if (Array.isArray(arr)) return arr;
  } catch (e) {
    // ถ้า parse ไม่ได้ ให้แยกด้วย comma
    return input.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// ---------- Controllers ---------- //
exports.createNews = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, content, published_date, status, tag, short_description } = req.body;
    const imageDescriptions = parseDescriptions(req.body.image_description);
    const videoDescriptions = parseDescriptions(req.body.video_description);

    let images = req.files?.image ? await saveImages(req.files.image, imageDescriptions, t) : [];
    const img_id = images[0]?.id || null;

    const news = await News.create({
      title, content, published_date, status,
      short_description,
      img_id,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction: t });

    // Handle video uploads
    const videoResources = await handleVideos(req.files, news.id, videoDescriptions, t);
    if (videoResources.length > 0) {
      await news.setResources(videoResources, { transaction: t });
    }

    if (tag) await handleTags(tag, news.id, t);

    const fullNews = await News.findByPk(news.id, {
      attributes: ['id', 'title', 'content', 'published_date', 'short_description', 'view_count'],
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['id', 'image_path']
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
      transaction: t
    });

    const result = {
      ...fullNews.toJSON(),
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
    const { title, content, published_date, status, tag, short_description } = req.body;
    const imageDescriptions = parseDescriptions(req.body.image_description);
    const videoDescriptions = parseDescriptions(req.body.video_description);

    const news = await News.findByPk(id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    Object.assign(news, { title, content, published_date, status, short_description });

    if (req.files?.image) {
      await removeImage(news.img_id, t);
      const newImages = await saveImages(req.files.image, imageDescriptions, t);
      news.img_id = newImages[0]?.id || news.img_id;
      for (const img of newImages) {
        img.ref_id = news.id;
        await img.save({ transaction: t });
      }
    }

    // Handle video updates
    let keepVideoIds = [];
    if (req.body.keep_video_ids) {
      try {
        keepVideoIds = JSON.parse(req.body.keep_video_ids);
      } catch {
        keepVideoIds = [];
      }
    }

    // หา Resource ทั้งหมดที่เป็นวิดีโอของข่าวนี้
    const existingResources = await Resource.findAll({
      include: [{
        model: ResourceFile,
        as: 'files'
      }],
      where: { type: 'video', news_id: news.id }
    });

    // ลบ Resource ที่ไม่ได้อยู่ใน keepVideoIds
    for (const resource of existingResources) {;
      // ถ้า resource นี้ไม่มีไฟล์ใดๆ ที่ id อยู่ใน keepVideoIds เลย ให้ลบ resource และไฟล์ทั้งหมด
      const filesToKeep = (resource.files || []).filter(file => keepVideoIds.includes(file.id));
      if (filesToKeep.length === 0) {
        // ลบไฟล์ทั้งหมดใน resource นี้
        for (const file of resource.files || []) {
          await file.destroy({ transaction: t });
        }
        await resource.destroy({ transaction: t });
      } else {
        // ถ้ามีไฟล์ที่ต้องเก็บไว้ ให้ลบเฉพาะไฟล์ที่ไม่ได้อยู่ใน keepVideoIds
        for (const file of resource.files || []) {
          if (!keepVideoIds.includes(file.id)) {
            await file.destroy({ transaction: t });
          }
        }
      }
    }

    // เพิ่ม Resource ใหม่จากไฟล์ที่อัปโหลดมา
    let newVideoResources = [];
    if (req.files?.video) {
      newVideoResources = await handleVideos(req.files, news.id, videoDescriptions, t);
    }

    // setResources ใหม่ (รวมของเดิมที่ keep + ของใหม่)
    const keptResources = existingResources.filter(r => keepVideoIds.includes(r.id));
    await news.setResources([...keptResources, ...newVideoResources], { transaction: t });

    await news.save({ transaction: t });
    if (tag) await handleTags(tag, news.id, t);

    const fullNews = await News.findByPk(news.id, {
      attributes: ['id', 'title', 'content', 'published_date', 'short_description', 'view_count'],
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['id', 'image_path']
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
    const { offset = 0, limit = 10, search = '' , category = '' , sort = 'DESC'} = req.query;
    const parsedOffset = parseInt(offset);
    const parsedLimit = parseInt(limit);
    const where = {
      deleted_at: null,
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { short_description: { [Op.like]: `%${search}%` } },
      ]
    };

    const totalCount = await News.count({ where });

    const newsList = await News.findAll({
      where,
      offset: +offset,
      limit: +limit,
      order: [['published_date', sort]],
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['id', 'image_path'],
          required: false
        },
        {
          model: Resource,
          as: 'resources',
          include: [
            { model: ResourceFile, as: 'files' }
          ],
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
            where: {name: {[Op.like]: `%${category}%`}},
            required: false
          }]
        }
      ]
    });
    console.log(newsList)
    const result = newsList.map(n => ({
      ...n.toJSON(),
    }));

    const pagination = generatePaginationLinks(req, parsedOffset, parsedLimit, totalCount, search);

    const tagList = await Tag.findAll()

    res.status(200).json({
      data: result,
      tag: tagList,
      pagination
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findOne({
      where: { id: req.params.id},
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['id', 'image_path']
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