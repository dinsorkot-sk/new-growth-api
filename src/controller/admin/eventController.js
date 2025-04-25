const db = require('../models');
const { sequelize, Event, Image, Tag, TagAssignment } = require('../../models');
const path = require('path');
const fs = require('fs');


exports.createEvent = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { title, description, event_date, status } = req.body;
    let img_id = null;

    if (req.file) {
      const image = await Image.create({
        ref_id: null,
        ref_type: 'event',
        image_path: '/upload/' + req.file.filename,
      });
      img_id = image.id;
    }

    const event = await Event.create({
      title,
      description,
      event_date,
      status,
      img_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const { tag } = req.body;

    if (tag) {
      let tags = [];
      try {
        tags = JSON.parse(req.body.tag);
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
            taggable_id: event.id,
            taggable_type: 'events',
            created_at: new Date(),
            updated_at: new Date()
          }, { transaction: t });
        }

      } catch (error) {
        console.error('Error creating tag:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getAllEvents = async (req, res) => {
  try {
    const { status = 'show', offset = 0, limit = 10 } = req.query;

    const events = await Event.findAll({
      where: {
        status: status,
      },
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['id', 'image_path'],
        },
      ],
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['event_date', 'DESC']],
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [
        { model: Image, as: 'image', attributes: ['id', 'image_path'] }
      ]
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });

    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, status } = req.body;
    const file = req.file;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await event.update({
      title: title || event.title,
      description: description || event.description,
      event_date: event_date || event.event_date,
      status: status || event.status,
      updated_at: new Date()
    });

    if (file) {
      let image = await Image.findOne({ where: { id: event.img_id } });

      const imagePath = `/upload/${file.filename}`;
      if (image) {
        await image.update({
          image_path: imagePath,
          updated_at: new Date()
        });
      } else {
        const newImage = await Image.create({
          ref_id: event.id,
          ref_type: 'event',
          image_path: imagePath,
          created_at: new Date()
        });

        await event.update({ img_id: newImage.id });
      }
    }

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await event.destroy();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};