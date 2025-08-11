const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const router = express.Router();

// Test endpoint
router.get('/test', async (req, res) => {
  console.log('🧪 TEST endpoint called');
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { items, customerName, specialInstructions } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }
    
    // Mock user for testing (replace with actual auth later)
    const mockUser = {
      userId: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ca'),
      name: customerName || 'Guest User'
    };
    
    // Calculate totals and validate items
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Menu item ${item.menuItem} is not available`
        });
      }
      
      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;
      
      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        subtotal: itemSubtotal
      });
    }
    
    const serviceFee = 5;
    const total = subtotal + serviceFee;
    
    // Calculate estimated time (average 15 minutes + 2 minutes per item)
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + 15 + (items.length * 2));

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `MRC${String(orderCount + 1).padStart(6, '0')}`;
    
    const order = new Order({
      orderNumber,
      customer: mockUser.userId,
      customerName: customerName || mockUser.name,
      items: orderItems,
      subtotal,
      serviceFee,
      total,
      specialInstructions,
      estimatedTime
    });
    
    await order.save();
    console.log('✅ Order saved successfully:', order.orderNumber);
    
    await order.populate([
      { path: 'customer', select: 'name email studentId' },
      { path: 'items.menuItem', select: 'name image category' }
    ]);

    // Emit socket event for staff dashboard
    const io = req.app.get('socketio');
    if (io) {
      console.log('📡 Emitting new-order event to staff and customer rooms');
      io.to('staff').emit('new-order', order);
      io.to('customer').emit('new-order', order);
    } else {
      console.log('⚠️ Socket.IO not available');
    }
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { customer: req.user.userId, isActive: true };
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('items.menuItem', 'name image category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get single order for tracking (no auth required)
router.get('/track/:id', async (req, res) => {
  try {
    console.log('🔍 Tracking order by ID:', req.params.id);
    
    const order = await Order.findOne({ 
      $or: [
        { _id: req.params.id },
        { orderNumber: req.params.id }
      ],
      isActive: true 
    })
      .populate('items.menuItem', 'name price imageUrl category');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log('✅ Order found for tracking:', order.orderNumber, 'Status:', order.status);
    
    res.json({
      success: true,
      order: order
    });
    
  } catch (error) {
    console.error('❌ Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order for tracking',
      error: error.message
    });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id, isActive: true };
    
    // Students can only view their own orders
    if (req.user.role === 'student') {
      query.customer = req.user.userId;
    }
    
    const order = await Order.findOne(query)
      .populate('customer', 'name email studentId')
      .populate('items.menuItem', 'name image category');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// Update order status (Staff/Admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    // Check if user is staff or admin
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff or Admin role required.'
      });
    }
    
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const updateData = { status };
    
    // Set completion time if order is completed
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customer', 'name email studentId')
     .populate('items.menuItem', 'name image category');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Cancel order
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id, isActive: true };
    
    // Students can only cancel their own orders
    if (req.user.role === 'student') {
      query.customer = req.user.userId;
    }
    
    const order = await Order.findOne(query);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order can be cancelled
    if (['completed', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

// Update order status (for staff)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const order = await Order.findById(id)
      .populate([
        { path: 'customer', select: 'name email studentId' },
        { path: 'items.menuItem', select: 'name image category' }
      ]);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update status and completion time
    order.status = status;
    if (status === 'completed') {
      order.completedAt = new Date();
    }
    
    await order.save();
    
    console.log('📦 Order status update:', order);
    
    // Emit socket event for real-time updates to both staff and customers
    const io = req.app.get('socketio');
    if (io) {
      // Broadcast to staff room
      io.to('staff').emit('order-status-updated', order);
      console.log('📡 Broadcasted order-status-updated to STAFF room');
      
      // Broadcast to customer room  
      io.to('customer').emit('order-status-updated', order);
      console.log('📡 Broadcasted order-status-updated to CUSTOMER room');
      
    } else {
      console.log('⚠️ Socket.IO not available for order status update');
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Get all orders (for staff)
router.get('/', async (req, res) => {
  try {
    console.log('📋 GET /api/orders called');
    const { page = 1, limit = 50, status } = req.query;
    
    let query = { isActive: true };
    
    if (status) {
      query.status = status;
    }
    
    console.log('🔍 Query:', query);
    
    const orders = await Order.find(query)
      .populate([
        { path: 'customer', select: 'name email studentId' },
        { path: 'items.menuItem', select: 'name image category' }
      ])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    console.log(`📦 Found ${orders.length} orders out of ${total} total`);
    
    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

module.exports = router;
