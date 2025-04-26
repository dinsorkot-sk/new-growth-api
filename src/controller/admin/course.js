const { Course, Industry, Resource, Image, sequelize } = require('../../models');
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

    // สร้าง course
    const file = req.file;
    let image = file ? await saveImage(file, null, t) : null;
    const course = await Course.create({
      name, description, resource_id, img_id: image?.id,
      created_at: new Date(), updated_at: new Date()
    }, { transaction: t });

    if (image) await image.update({ ref_id: course.id }, { transaction: t });

    // รับข้อมูล industries เป็น array
    const industriesData = [];

    // วนลูปข้อมูลแต่ละ industry
    for (const item of industries) {
      // ค้นหา industry ที่มีอยู่แล้ว
      let industry = await Industry.findOne({
        where: { name: item },
        transaction: t
      });

      // ถ้าไม่มีให้สร้างใหม่
      if (!industry) {
        industry = await Industry.create({
          name: item,
          course_id: course.id,
          created_at: new Date(),
          updated_at: new Date()
        }, { transaction: t });
      }

      // เพิ่มเข้า array สำหรับเชื่อมกับ course
      industriesData.push(industry);
    }

    // เชื่อม industries กับ course
    if (industriesData.length > 0) {
      await course.addIndustries(industriesData, { transaction: t });
    }

    // ดึงข้อมูล course พร้อมความสัมพันธ์
    const fullCourse = await Course.findByPk(course.id, {
      include: [
        { model: Image, as: 'image' },
        { model: Industry, as: 'industries' }
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

    // แปลงข้อมูล industries ให้เป็น array ถ้าส่งมาเป็น string
    if (typeof industries === 'string') {
      industries = industries.split(',').map(item => item.trim());
    }

    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.update({ 
      name, 
      description, 
      resource_id, 
      updated_at: new Date() 
    }, { transaction: t });

    // จัดการรูปภาพ
    if (req.file) {
      const oldImage = await Image.findByPk(course.img_id);
      const newImage = await saveImage(req.file, course.id, t);
      if (oldImage) await oldImage.destroy({ transaction: t });
      await course.update({ img_id: newImage.id }, { transaction: t });
    }

    // ลบความสัมพันธ์ industries เก่าทั้งหมด
    await course.setIndustries([], { transaction: t });

    // สร้าง industries array ใหม่
    const industriesData = [];
    for (const item of industries) {
      // ค้นหา industry ที่มีอยู่แล้ว
      let industry = await Industry.findOne({
        where: { name: item },
        transaction: t
      });
      
      // ถ้าไม่มีให้สร้างใหม่
      if (!industry) {
        industry = await Industry.create({
          name: item,
          course_id: course.id,
          created_at: new Date(),
          updated_at: new Date()
        }, { transaction: t });
      }
      
      // เพิ่มเข้า array
      industriesData.push(industry);
    }

    // เชื่อม industries กับ course
    if (industriesData.length > 0) {
      await course.addIndustries(industriesData, { transaction: t });
    }

    // ดึงข้อมูล course พร้อมความสัมพันธ์
    const updatedCourse = await Course.findByPk(id, {
      include: [
        { model: Image, as: 'image' },
        { model: Industry, as: 'industries' }
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
