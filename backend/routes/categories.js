const express = require('express');
const Category = require('../models/Category');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadSingleImage, uploadSingleImageIfPresent } = require('../middleware/upload');
const router = express.Router();

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const emitEvent = (req, event, payload) => {
  const sendEvent = req.app.get('sendSseEvent');

  if (typeof sendEvent === 'function') {
    sendEvent(event, payload);
  }
};

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'n'].includes(normalized)) {
    return false;
  }

  return undefined;
};

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { active = 'true', search } = req.query;

    let query = {};
    if (active !== 'all') {
      query.isActive = active === 'true';
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      query.name = { $regex: safeSearch, $options: 'i' };
    }

    const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
    
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

// Create category (Admin/Staff only)
router.post('/', protect, authorizeRoles('admin', 'staff'), uploadSingleImage, async (req, res) => {
  try {
    const { name, description, sortOrder, isActive, icon, image } = req.body || {};
    const imageFileName = req.file?.filename;
    const resolvedImage = imageFileName || (image ? String(image).trim() : '');

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    if (!resolvedImage) {
      return res.status(400).json({
        success: false,
        message: 'Category image is required'
      });
    }

    const parsedIsActive = parseBoolean(isActive);
    if (isActive !== undefined && parsedIsActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Active flag must be true or false'
      });
    }

    const parsedSortOrder = sortOrder !== undefined && sortOrder !== '' ? Number(sortOrder) : undefined;
    if (parsedSortOrder !== undefined && !Number.isFinite(parsedSortOrder)) {
      return res.status(400).json({
        success: false,
        message: 'Sort order must be a number'
      });
    }

    const categoryData = {
      name: String(name).trim(),
      image: resolvedImage,
      icon: icon ? String(icon).trim() : resolvedImage,
      isActive: parsedIsActive ?? true
    };

    // Only set optional fields when they have real values — passing undefined
    // explicitly to the Mongoose constructor overrides schema defaults
    if (description && String(description).trim()) {
      categoryData.description = String(description).trim();
    }

    if (parsedSortOrder !== undefined) {
      categoryData.sortOrder = parsedSortOrder;
    }

    const category = new Category(categoryData);
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

    emitEvent(req, 'category-created', { category });
    
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }
  }
});

// Update category (Admin/Staff only)
router.put('/:id', protect, authorizeRoles('admin', 'staff'), uploadSingleImageIfPresent, async (req, res) => {
  try {
    const { name, description, sortOrder, isActive, icon, image } = req.body || {};
    const updates = {};

    if (name !== undefined) {
      updates.name = String(name).trim();
    }

    if (description !== undefined) {
      updates.description = String(description).trim();
    }

    if (sortOrder !== undefined) {
      const parsedSortOrder = Number(sortOrder);
      if (!Number.isFinite(parsedSortOrder)) {
        return res.status(400).json({
          success: false,
          message: 'Sort order must be a number'
        });
      }
      updates.sortOrder = parsedSortOrder;
    }

    if (isActive !== undefined) {
      const parsedIsActive = parseBoolean(isActive);
      if (parsedIsActive === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Active flag must be true or false'
        });
      }
      updates.isActive = parsedIsActive;
    }

    if (icon !== undefined) {
      updates.icon = icon ? String(icon).trim() : '';
    }

    if (req.file?.filename) {
      updates.image = req.file.filename;
      if (!updates.icon) {
        updates.icon = req.file.filename;
      }
    } else if (image !== undefined) {
      updates.image = image ? String(image).trim() : '';
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

    emitEvent(req, 'category-updated', { category });
    
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    }
  }
});

// Delete category (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

    emitEvent(req, 'category-deleted', { id: req.params.id });
    
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

module.exports = router;
