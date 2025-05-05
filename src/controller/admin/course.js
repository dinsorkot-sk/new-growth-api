const path = require('path');
const multer = require('multer');
const fs = require('fs')
const { Course, Industry, Resource, Image, ResourceFile, Review, sequelize } = require('../../models');
const { Op } = require('sequelize');

// Helper functions
const saveImage = async (file, refId = null, t) => {
  return Image.create({
    ref_type: 'course',
    ref_id: refId,
    image_path: `/upload/${file.filename}`,
    created_at: new Date(),
    updated_at: new Date()
  }, { transaction: t });
};

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
}

// Controllers
exports.createCourse = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, description, is_downloadable, sub_description, additional_info, instructor } = req.body;
    let industries = req.body.industries || [];

    if (typeof industries === 'string') {
      industries = industries.split(',').map(item => item.trim());
    }

    const files = req.files;
    const imageFile = files?.image?.[0] || null;
    const videoFile = files?.video?.[0] || null;

    // Save image if provided
    let image = imageFile ? await saveImage(imageFile, null, t) : null;

    // Create new resource if video is uploaded
    let videoResource = null;
    if (videoFile) {
      videoResource = await Resource.create({
        title: name,
        description,
        type: 'video',
        duration: null, // Optional: set if available
        author: null,
        status: 'show',
        published_date: new Date(),
      }, { transaction: t });

      const fileExtension = path.extname(videoFile.originalname).replace('.', '');
      await ResourceFile.create({
        resource_id: videoResource.id,
        file_type: fileExtension,
        file_path: videoFile.path.replace(/\\/g, '/'),
        is_downloadable: is_downloadable === 'true' || is_downloadable === true
      }, { transaction: t });
    }

    // Create course
    const course = await Course.create({
      name,
      description,
      sub_description,
      additional_info,
      instructor,
      resource_id: videoResource?.id,
      img_id: image?.id || null,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction: t });

    if (image) {
      await image.update({ ref_id: course.id }, { transaction: t });
    }

    // Process industries
    const industriesData = [];
    for (const item of industries) {
      let industry = await Industry.findOne({ where: { name: item }, transaction: t });
      if (!industry) {
        industry = await Industry.create({
          name: item,
          course_id: course.id,
          created_at: new Date(),
          updated_at: new Date()
        }, { transaction: t });
      }
      industriesData.push(industry);
    }

    if (industriesData.length > 0) {
      await course.addIndustries(industriesData, { transaction: t });
    }

    // Get full course with associations
    const fullCourse = await Course.findByPk(course.id, {
      include: [
        { model: Image, as: 'image' },
        { model: Industry, as: 'industries' },
        {
          model: Resource, as: 'resources', include: [
            { model: ResourceFile, as: 'files' }
          ]
        }
      ],
      transaction: t
    });

    await t.commit();
    res.status(201).json({
      message: 'สร้างคอร์สสำเร็จ',
      data: fullCourse.toJSON()
    });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateCourse = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, description, is_downloadable, sub_description, additional_info, instructor } = req.body;
    let industries = req.body.industries || [];

    if (typeof industries === 'string') {
      industries = industries.split(',').map(item => item.trim());
    }

    const course = await Course.findByPk(id, { transaction: t });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const files = req.files;
    const imageFile = files?.image?.[0] || null;
    const videoFile = files?.video?.[0] || null;

    await course.update({
      name,
      description,
      sub_description,
      additional_info,
      instructor,
      updated_at: new Date()
    }, { transaction: t });

    // Image
    if (imageFile) {
      const oldImage = await Image.findByPk(course.img_id, { transaction: t });
      const newImage = await saveImage(imageFile, course.id, t);
      if (oldImage) await oldImage.destroy({ transaction: t });
      await course.update({ img_id: newImage.id }, { transaction: t });
    }

    // Video
    if (videoFile) {
      if (course.reresource_id) {
        const oldResource = await Resource.findByPk(course.reresource_id, {
          include: [{ model: ResourceFile, as: 'files' }],
          transaction: t
        });

        if (oldResource) {
          // ลบไฟล์แนบก่อน
          for (const file of oldResource.files || []) {
            await file.destroy({ transaction: t });
          }
          await oldResource.destroy({ transaction: t });
        }
      }

      const newResource = await Resource.create({
        title: name,
        description,
        type: 'video',
        duration: null,
        author: null,
        status: 'active',
        published_date: new Date()
      }, { transaction: t });

      const fileExtension = path.extname(videoFile.originalname).replace('.', '');

      await ResourceFile.create({
        resource_id: newResource.id,
        file_type: fileExtension,
        file_path: videoFile.path,
        is_downloadable: is_downloadable === 'true' || is_downloadable === true
      }, { transaction: t });

      await course.update({ reresource_id: newResource.id }, { transaction: t });
    }

    // Industries
    await Industry.destroy({ where: { course_id: course.id }, transaction: t });

    for (const item of industries) {
      await Industry.create({
        name: item,
        course_id: course.id,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });
    }


    // Include updated course with relations
    const updatedCourse = await Course.findByPk(id, {
      include: [
        { model: Image, as: 'image' },
        { model: Industry, as: 'industries' },
        {
          model: Resource, as: 'resources', include: [
            { model: ResourceFile, as: 'files' }
          ]
        }
      ],
      transaction: t
    });

    await t.commit();
    res.status(200).json({
      message: 'Course updated successfully',
      data: updatedCourse.toJSON()
    });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.destroy();
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const { offset = 0, limit = 10, search = '' } = req.query;
    const parsedOffset = parseInt(offset);
    const parsedLimit = parseInt(limit);

    const totalCount = await Course.count({ where: { deleted_at: null } });
    const courses = await Course.findAll({
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

    const industries = await Industry.findAll();

    const pagination = generatePaginationLinks(req, parsedOffset, parsedLimit, totalCount, search);

    res.status(200).json({ data: courses, industries, pagination });
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