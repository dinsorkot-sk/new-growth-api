
const path = require('path');
const multer = require('multer');
const fs = require('fs')
const { Course, Industry, Resource, Image, ResourceFile, sequelize } = require('../../models');
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
  
      const totalCount = await Course.count({ where: { deleted_at: null } });
      const courses = await Course.findAll({
        include: [
          // แก้ไข alias จาก 'industry' เป็น 'industries'
          { model: Industry, as: 'industries', attributes: ['id', 'name'] },
          {
            model: Resource, as: 'resources', include: [
              { model: ResourceFile, as: 'files' }
            ]
          },
          { model: Image, as: 'image', attributes: ['id', 'image_path'] }
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
          // แก้ไข alias จาก 'industry' เป็น 'industries'
          { model: Industry, as: 'industries', attributes: ['id', 'name'] },
          {
            model: Resource, as: 'resources', include: [
              { model: ResourceFile, as: 'files' }
            ]
          },
          { model: Image, as: 'image', attributes: ['id', 'image_path'] }
        ]
      });
  
      if (!course) return res.status(404).json({ error: 'Course not found' });
  
      res.status(200).json(course);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };