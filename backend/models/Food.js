const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    maxlength: [120, 'Name cannot exceed 120 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters'],
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be at least 0']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [60, 'Category cannot exceed 60 characters']
  },
  image: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['veg', 'non-veg'],
    required: [true, 'Food type is required']
  },
  rating: {
    type: Number,
    default: 4,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

foodSchema.index({ category: 1, createdAt: -1 });
foodSchema.index({ type: 1, category: 1 });
foodSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Food', foodSchema);
