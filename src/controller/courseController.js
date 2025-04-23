const { Course, Industry, Resource, Image } = require('../models');

exports.getAllCourses = async (req, res) => {
  try {
    const { offset = 0, limit = 10 } = req.query;

    const courses = await Course.findAll({
      include: [
        { model: Industry, as: 'industry', attributes: ['id', 'name'] },
        { model: Resource, as: 'resource' },
        { model: Image, as: 'image', attributes: ['id', 'image_path'] }
      ],
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        { model: Industry, as: 'industry', attributes: ['id', 'name'] },
        { model: Resource, as: 'resource' },
        { model: Image, as: 'image', attributes: ['id', 'image_path'] }
      ]
    });

    if (!course) return res.status(404).json({ error: 'Course not found' });

    res.status(200).json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { name, description, industry_id, reresource_id } = req.body;
    const file = req.file;

    let img_id = null;
    if (file) {
      const image = await Image.create({
        ref_type: 'course',
        ref_id: 0, // จะอัปเดตหลังจากสร้าง course
        image_path: `/upload/${file.filename}`,
        created_at: new Date()
      });
      img_id = image.id;
    }

    const course = await Course.create({
      name,
      description,
      industry_id,
      reresource_id,
      img_id,
      created_at: new Date(),
    });

    if (img_id) {
      await Image.update(
        { ref_id: course.id },
        { where: { id: img_id } }
      );
    }

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, industry_id, reresource_id } = req.body;
    const file = req.file;

    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.update({
      name: name || course.name,
      description: description || course.description,
      industry_id: industry_id || course.industry_id,
      reresource_id: reresource_id || course.reresource_id,
      updated_at: new Date()
    });

    if (file) {
      const imagePath = `/upload/${file.filename}`;
      let image = await Image.findOne({ where: { id: course.img_id } });

      if (image) {
        await image.update({ image_path: imagePath, updated_at: new Date() });
      } else {
        const newImage = await Image.create({
          ref_type: 'course',
          ref_id: course.id,
          image_path: imagePath,
          created_at: new Date()
        });
        await course.update({ img_id: newImage.id });
      }
    }

    res.status(200).json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
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
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
