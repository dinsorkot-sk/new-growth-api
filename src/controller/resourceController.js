const { Resource, ResourceFile, ResourceType } = require('../models');
const path = require('path');
const fs = require('fs');

// ✅ CREATE resource
exports.createResource = async (req, res) => {
    try {
      const {
        title, description, type_id, duration,
        pages, author, published_date, status
      } = req.body;
  
      const newResource = await Resource.create({
        title, description, type_id, duration,
        pages, author, published_date, status,
        created_at: new Date(), updated_at: new Date()
      });
  
      if (req.files && req.files.length > 0) {
        const files = req.files.map((file, index) => ({
          resource_id: newResource.id,
          file_type: path.extname(file.originalname).replace('.', ''), // pdf, mp4
          file_path: file.path,
          is_downloadable: req.body.is_downloadable?.[index] === 'true',
          created_at: new Date(),
          updated_at: new Date()
        }));
  
        await ResourceFile.bulkCreate(files);
      }
  
      res.status(201).json({ message: 'Resource created successfully', resource: newResource });
    } catch (err) {
      console.error('Create resource error:', err);
      res.status(500).json({ error: 'Failed to create resource' });
    }
  };
// ✅ GET ALL
exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.findAll({
      where: { status: 'show' },
      include: [
        { model: ResourceType, as: 'type' },
        { model: ResourceFile, as: 'files' }
      ]
    });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

// ✅ GET BY ID
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id, {
      include: [
        { model: ResourceType, as: 'type' },
        { model: ResourceFile, as: 'files' }
      ]
    });

    if (!resource) return res.status(404).json({ message: 'Not found' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching resource' });
  }
};

// ✅ UPDATE
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = new Date();

    await Resource.update(updateData, { where: { id } });
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
};

// ✅ DELETE
exports.deleteResource = async (req, res) => {
  try {
    await Resource.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};
