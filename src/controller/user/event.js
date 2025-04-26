const { Op } = require('sequelize');
const { sequelize, Event, Image, Tag, TagAssignment } = require('../../models');
const path = require('path');
const fs = require('fs');

// ---------- Helper Functions ---------- //
const saveImage = async (file, refId = null, t) => {
  return await Image.create({
    ref_id: refId,
    ref_type: 'event',
    image_path: `/upload/${file.filename}`,
    created_at: new Date(),
    updated_at: new Date()
  }, { transaction: t });
};

const handleTags = async (tags, eventId, t) => {
  const tagList = Array.isArray(tags) ? tags : JSON.parse(tags);
  const existing = await TagAssignment.findAll({
    where: { taggable_id: eventId, taggable_type: 'events' },
    include: [{ model: Tag, as: 'tag' }],
    transaction: t
  });

  const existingMap = new Map();
  for (const a of existing) if (a.tag) existingMap.set(a.tag.name, a);

  for (const [name, a] of existingMap) {
    if (!tagList.includes(name)) await a.destroy({ transaction: t });
  }

  for (const name of tagList) {
    if (!existingMap.has(name)) {
      const [tag] = await Tag.findOrCreate({
        where: { name },
        defaults: { created_at: new Date(), updated_at: new Date() },
        transaction: t
      });

      await TagAssignment.create({
        tag_id: tag.id,
        taggable_id: eventId,
        taggable_type: 'events',
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
exports.getAllEvents = async (req, res) => {
  try {
    const { offset = 0, limit = 10, search = '' } = req.query;
    const parsedOffset = parseInt(offset);
    const parsedLimit = parseInt(limit);

    const where = {
      status: 'show',
      deleted_at: null,
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    };
    
    const totalCount = await Event.count({ where });

    const events = await Event.findAll({
      attributes: ['id', 'title', 'description', 'event_date', 'status'],
      where,
      offset: +offset,
      limit: +limit,
      order: [['event_date', 'DESC']],
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
          where: { taggable_type: 'events' },
          include: [{
            model: Tag,
            as: 'tag',
            attributes: ['id', 'name'],
            where: search ? { name: { [Op.like]: `%${search}%` } } : undefined
          }]
        }
      ]
    });

    const result = events.map(event => ({
      ...event.toJSON(),
    }));

    const pagination = generatePaginationLinks(req, parsedOffset, parsedLimit, totalCount, search);

    res.status(200).json({
      data: result,
      pagination
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
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
          where: { taggable_type: 'events' },
          include: [{
            model: Tag,
            as: 'tag',
            attributes: ['id', 'name'],
          }]
        }
      ]
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });
    const result = {
      ...event.toJSON(),
    };
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
