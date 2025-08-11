const express = require('express');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all menu items with category filter
router.get('/', async (req, res) => {
  try {
    const { category, search, available, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category) {
      const categoryDoc = await Category.findOne({ name: category, isActive: true });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }
    
    // Filter by availability
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: 'category',
      sort: { popularity: -1, createdAt: -1 }
    };
    
    const menuItems = await MenuItem.find(query)
      .populate('category', 'name icon')
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);
    
    const total = await MenuItem.countDocuments(query);
    
    res.json({
      success: true,
      data: menuItems,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
    
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: error.message
    });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('category');
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      data: menuItem
    });
    
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu item',
      error: error.message
    });
  }
});

// Create menu item (Admin/Staff only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin or staff
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Staff role required.'
      });
    }
    
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    await menuItem.populate('category');
    
    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
    
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create menu item',
      error: error.message
    });
  }
});

// Update menu item (Admin/Staff only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin or staff
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Staff role required.'
      });
    }
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category');
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
    
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message
    });
  }
});

// Delete menu item (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message
    });
  }
});

module.exports = router;
