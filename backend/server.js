const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

/*
---------------------------------------
Socket.IO Setup
---------------------------------------
*/
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

/*
---------------------------------------
Security Middleware
---------------------------------------
*/
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

/*
---------------------------------------
CORS
---------------------------------------
*/
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/*
---------------------------------------
Body Parsers
---------------------------------------
*/
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/*
---------------------------------------
Static Files
---------------------------------------
*/
app.use('/uploads', express.static('uploads'));

/*
---------------------------------------
MongoDB Connection
---------------------------------------
*/
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mrc_foods'
    );

    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('Server will continue running without DB.');
  }
};

connectDB();

/*
---------------------------------------
Socket.IO Events
---------------------------------------
*/
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`👤 User ${socket.id} joined room: ${room}`);
  });

  socket.on('update-order-status', (data) => {
    console.log('📦 Order status update:', data);

    io.emit('order-status-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

//Temp Comment
app.set('socketio', io);

/*
---------------------------------------
API Routes
---------------------------------------
*/
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));

/*
---------------------------------------
Root Route (API Info)
---------------------------------------
*/
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'MRC Foods API',
    status: 'running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders'
    }
  });
});

/*
---------------------------------------
Health Check
---------------------------------------
*/
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'MRC Foods API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected'
  });
});

/*
---------------------------------------
Global Error Handler
---------------------------------------
*/
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.stack);

  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error'
  });
});

/*
---------------------------------------
404 Handler
---------------------------------------
*/
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/*
---------------------------------------
Server Start
---------------------------------------
*/
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📡 Socket.IO server running`);
});