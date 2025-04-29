const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Course, Resource, ResourceFile, Image } = require('../../models');

exports.createCourse = async (req, res) => {
    try {
      const { name, description, industry_id, description_about, description_sub, status } = req.body;
      const imageFile = req.files['image'] ? req.files['image'][0] : null;
      const videoFile = req.files['video'] ? req.files['video'][0] : null;
  
      if (!name || !description || !industry_id) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }
  
      // 1. บันทึก Resource (ข้อมูลเกี่ยวกับไฟล์)
      const newResource = await Resource.create({
        title: name,
        description: description_about || '',
        type: 'video',
        status: 'show',
        created_at: new Date(),
        updated_at: new Date(),
      });
  
      // 2. บันทึก ResourceFile (ไฟล์วิดีโอ)
      if (videoFile) {
        await ResourceFile.create({
          resource_id: newResource.id,
          file_type: 'video',
          file_path: path.join('video', videoFile.filename),
          is_downloadable: false,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
  
      // 3. บันทึก Image (ไฟล์รูปภาพ)
      let newImage = null;
      if (imageFile) {
        newImage = await Image.create({
          ref_id: 0, // ตอนแรกยังไม่รู้ course_id เพราะยังไม่ได้สร้าง
          ref_type: 'course',
          image_path: path.join('upload', imageFile.filename),
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
  
      // 4. บันทึก Course (ข้อมูลหลักของคอร์ส)
      const newCourse = await Course.create({
        name,
        description,
        industry_id,
        reresource_id: newResource.id,
        img_id: newImage ? newImage.id : null,
        description_about,
        description_sub,
        status,
        created_at: new Date(),
        updated_at: new Date(),
      });
  
      // 5. อัปเดต ref_id ของ Image ให้ชี้ไปยัง course_id ที่เพิ่งสร้าง
      if (newImage) {
        await newImage.update({ ref_id: newCourse.id });
      }
  
      res.status(201).json({
        message: 'Course created successfully',
        course: newCourse,
      });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };