const { Course, Industry, Resource, Image, ResourceType, sequelize } = require('../../models');
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
};

// Controllers
exports.createCourse = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, description, resource_id } = req.body;
    let industries = req.body.industries || [];

    if (typeof industries === 'string') {
      industries = industries.split(',').map(item => item.trim());
    }

    const files = req.files;
    const imageFile = files?.image?.[0] || null;
    const videoFile = files?.video?.[0] || null;

    // เซฟรูป
    let image = imageFile ? await saveImage(imageFile, null, t) : null;

    // ถ้ามีวิดีโอ → สร้าง resource ใหม่
    let videoResource = null;
    if (videoFile) {
      videoResource = await Resource.create({
        title: name,
        description,
        type: 'video',
        duration: null, // คุณจะเพิ่มได้ถ้ามีข้อมูล duration มาด้วย
        author: null,
        status: 'active', // หรือจะกำหนด status จาก req.body ก็ได้
        published_date: new Date(),
        file_path: videoFile.path
      }, { transaction: t });
    }

    // สร้างคอร์ส
    const course = await Course.create({
      name,
      description,
      resource_id: videoResource?.id || resource_id || null,
      img_id: image?.id || null,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction: t });

    if (image) await image.update({ ref_id: course.id }, { transaction: t });

    // จัดการ industries
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

    const fullCourse = await Course.findByPk(course.id, {
      include: [
        { model: Image, as: 'image' },
        { model: Industry, as: 'industries' },
        { model: Resource, as: 'resource'}
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
    const { name, description, resource_id } = req.body;
    let industries = req.body.industries || [];

    // แปลงข้อมูล industries เป็น array ถ้าเป็น string
    if (typeof industries === 'string') {
      industries = industries.split(',').map(item => item.trim());
    }

    const course = await Course.findByPk(id, { transaction: t });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const files = req.files;
    const imageFile = files?.image?.[0] || null;
    const videoFile = files?.video?.[0] || null;

    // อัปเดตข้อมูลหลักของ course
    await course.update({
      name,
      description,
      updated_at: new Date()
    }, { transaction: t });

    // จัดการไฟล์ภาพใหม่ (image)
    if (imageFile) {
      const oldImage = await Image.findByPk(course.img_id, { transaction: t });
      const newImage = await saveImage(imageFile, course.id, t);
      if (oldImage) {
        await oldImage.destroy({ transaction: t });
      }
      await course.update({ img_id: newImage.id }, { transaction: t });
    }

    // จัดการไฟล์วิดีโอใหม่ (video)
    if (videoFile) {
      // ถ้ามี resource เดิมอยู่แล้ว (จาก resource_id) → ลบออก
      if (course.resource_id) {
        const oldResource = await Resource.findByPk(course.resource_id, { transaction: t });
        if (oldResource) {
          await oldResource.destroy({ transaction: t });
        }
      }

      // สร้าง resource ใหม่
      const newVideo = await Resource.create({
        title: name,
        description,
        type: 'video',
        duration: null, // คุณใส่เพิ่มเองได้
        author: null,
        status: 'active',
        published_date: new Date(),
        file_path: videoFile.path
      }, { transaction: t });

      await course.update({ resource_id: newVideo.id }, { transaction: t });
    } else if (resource_id) {
      // ถ้าอัปเดต resource_id จาก body
      await course.update({ resource_id }, { transaction: t });
    }

    // จัดการ industries ใหม่
    await course.setIndustries([], { transaction: t });

    const industriesData = [];
    for (const item of industries) {
      let industry = await Industry.findOne({
        where: { name: item },
        transaction: t
      });
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

    // ดึงข้อมูล course ที่อัปเดตเสร็จแล้ว
    const updatedCourse = await Course.findByPk(id, {
      include: [
        { model: Image, as: 'image' },
        { model: Industry, as: 'industries' },
        { model: Resource, as: 'resource'}
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
        // แก้ไข alias จาก 'industry' เป็น 'industries'
        { model: Industry, as: 'industries', attributes: ['id', 'name'] },
        { model: Resource, as: 'resource' },
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
        { model: Resource, as: 'resource' },
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

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        { model: Industry, as: 'industries', attributes: ['id', 'name'] },
        { model: Resource, as: 'resource' },
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
