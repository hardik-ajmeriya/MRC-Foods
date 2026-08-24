const express = require('express');
const Food = require('../models/Food');
const { protect } = require('../middleware/authMiddleware');
const { allowStaffOrAdmin } = require('../middleware/foodAccess');
const { uploadSingleImage, uploadSingleImageIfPresent } = require('../middleware/upload');

const router = express.Router();

const emitEvent = (req, event, payload) => {
  const sendEvent = req.app.get('sendSseEvent');

  if (typeof sendEvent === 'function') {
    sendEvent(event, payload);
  }
};

const parsePrice = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'veg') {
    return 'veg';
  }

  if (normalized === 'non-veg' || normalized === 'nonveg') {
    return 'non-veg';
  }

  return '';
};

const buildQuery = ({ search, category, type, available, isAvailable }) => {
  const query = {};

  if (category) {
    const safeCategory = escapeRegex(category);
    query.category = { $regex: `^${safeCategory}$`, $options: 'i' };
  }

  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { category: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } }
    ];
  }

  const normalizedType = normalizeType(type);
  if (normalizedType) {
    query.type = normalizedType;
  }

  const parsedAvailable = parseBoolean(available ?? isAvailable);
  if (parsedAvailable !== undefined) {
    query.isAvailable = parsedAvailable;
  }

  return query;
};

// Get all food items
router.get('/', async (req, res) => {
  try {
    const query = buildQuery(req.query || {});
    const foods = await Food.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: foods
    });
  } catch (error) {
    console.error('Get foods error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch food items',
      error: error.message
    });
  }
});

// Get single food item
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    return res.json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('Get food error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch food item',
      error: error.message
    });
  }
});

// Create food item (Staff/Admin only)
router.post('/', protect, allowStaffOrAdmin, uploadSingleImage, async (req, res) => {
  try {
    const { name, price, category, rating, type, description, image, isAvailable } = req.body || {};
    const imageFileName = req.file?.filename;
    const resolvedImage = imageFileName || (image ? String(image).trim() : '');

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Food name is required'
      });
    }

    const parsedPrice = parsePrice(price);
    if (parsedPrice === null || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    if (!category || !String(category).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    if (!resolvedImage) {
      return res.status(400).json({
        success: false,
        message: 'Food image is required'
      });
    }

    const normalizedType = normalizeType(type);
    if (!normalizedType) {
      return res.status(400).json({
        success: false,
        message: 'Food type must be veg or non-veg'
      });
    }

    const parsedRating = rating !== undefined && rating !== '' ? Number(rating) : undefined;
    if (parsedRating !== undefined && !Number.isFinite(parsedRating)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number'
      });
    }

    const parsedAvailability = parseBoolean(isAvailable);
    if (isAvailable !== undefined && parsedAvailability === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be true or false'
      });
    }

    const food = await Food.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      price: parsedPrice,
      category: String(category).trim(),
      image: resolvedImage,
      type: normalizedType,
      rating: parsedRating,
      isAvailable: parsedAvailability ?? true
    });

    emitEvent(req, 'food-created', { food });

    return res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: food
    });
  } catch (error) {
    console.error('Create food error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create food item',
      error: error.message
    });
  }
});

// Update food item (Staff/Admin only)
router.put('/:id', protect, allowStaffOrAdmin, uploadSingleImageIfPresent, async (req, res) => {
  try {
    const { name, price, category, image, rating, isAvailable, type, description } = req.body || {};
    const updates = {};
    const imageFileName = req.file?.filename;

    if (name !== undefined) {
      updates.name = String(name).trim();
    }

    if (description !== undefined) {
      updates.description = String(description).trim();
    }

    if (price !== undefined) {
      const parsedPrice = parsePrice(price);
      if (parsedPrice === null || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid price is required'
        });
      }
      updates.price = parsedPrice;
    }

    if (category !== undefined) {
      updates.category = String(category).trim();
    }

    if (imageFileName) {
      updates.image = imageFileName;
    } else if (image !== undefined) {
      updates.image = image ? String(image).trim() : '';
    }

    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (!Number.isFinite(parsedRating)) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a number'
        });
      }
      updates.rating = parsedRating;
    }

    if (type !== undefined) {
      const normalizedType = normalizeType(type);
      if (!normalizedType) {
        return res.status(400).json({
          success: false,
          message: 'Food type must be veg or non-veg'
        });
      }
      updates.type = normalizedType;
    }

    if (isAvailable !== undefined) {
      const parsedAvailability = parseBoolean(isAvailable);
      if (parsedAvailability === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Availability must be true or false'
        });
      }
      updates.isAvailable = parsedAvailability;
    }

    const food = await Food.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    emitEvent(req, 'food-updated', { food });

    return res.json({
      success: true,
      message: 'Food item updated successfully',
      data: food
    });
  } catch (error) {
    console.error('Update food error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update food item',
      error: error.message
    });
  }
});

// Update availability (Staff/Admin only)
router.patch('/:id/availability', protect, allowStaffOrAdmin, async (req, res) => {
  try {
    const parsedAvailability = parseBoolean(req.body?.isAvailable ?? req.body?.available);

    if (parsedAvailability === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be true or false'
      });
    }

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { isAvailable: parsedAvailability },
      { new: true }
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    emitEvent(req, 'food-availability', { food });

    return res.json({
      success: true,
      message: 'Availability updated successfully',
      data: food
    });
  } catch (error) {
    console.error('Update availability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message
    });
  }
});

// Delete food item (Staff/Admin only)
router.delete('/:id', protect, allowStaffOrAdmin, async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    emitEvent(req, 'food-deleted', { id: req.params.id });

    return res.json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    console.error('Delete food error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete food item',
      error: error.message
    });
  }
});

module.exports = router;
