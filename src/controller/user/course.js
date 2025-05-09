const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Course, Industry, Resource, Image, ResourceFile, sequelize, Review, TagAssignment, Tag } = require('../../models');
const { Op } = require('sequelize');

const generatePaginationLinks = (req, offset, limit, totalCount, search = '') => {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);
  const prevOffset = offset - limit;
  const nextOffset = offset + limit;

  return {
    totalCount,
    currentPage,
    totalPages,
    prev: currentPage > 1 ? `${baseUrl}?offset=${prevOffset}&limit=${limit}&search=${encodeURIComponent(search)}` : null,
    next: currentPage < totalPages ? `${baseUrl}?offset=${nextOffset}&limit=${limit}&search=${encodeURIComponent(search)}` : null
  };
};

exports.getAllCourses = async (req, res) => {
  try {
    const { offset = 0, limit = 10, search = '' } = req.query;
    const parsedOffset = parseInt(offset);
    const parsedLimit = parseInt(limit);

    const whereClause = {
      deleted_at: null
    };

    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    const totalCount = await Course.count({ where: whereClause });
    const courses = await Course.findAll({
      where: whereClause,
      include: [
        { model: Industry, as: 'industries', attributes: ['id', 'name'] },
        {
          model: Resource, as: 'resources', include: [
            { model: ResourceFile, as: 'files' }
          ]
        },
        { model: Image, as: 'image', attributes: ['id', 'image_path'] },
        { model: Review, as: 'review' }
      ],
      offset: parsedOffset,
      limit: parsedLimit,
      order: [['created_at', 'DESC']]
    });

    const pagination = generatePaginationLinks(req, parsedOffset, parsedLimit, totalCount, search);

    res.status(200).json({ data: courses, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        { model: Industry, as: 'industries', attributes: ['id', 'name'] },
        {
          model: Resource, as: 'resources', include: [
            { model: ResourceFile, as: 'files' }
          ]
        },
        { model: Image, as: 'image', attributes: ['id', 'image_path'] },
        { model: Review, as: 'review' }
      ]
    });

    if (!course) return res.status(404).json({ error: 'Course not found' });

    res.status(200).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateView = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { view_count } = req.body;

    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.view_count = view_count;
    await course.save({ transaction: t });

    const fullCourse = await Course.findByPk(course.id, {
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
          where: { taggable_type: 'course' },
          include: [
            {
              model: Tag,
              as: 'tag',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      transaction: t
    });

    await t.commit();
    res.json({ message: 'Course updated', data: fullCourse });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error updating course', error: err.message });
  }
};
