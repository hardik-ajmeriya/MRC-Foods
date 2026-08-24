const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const { EventEmitter } = require('events');
require('dotenv').config();

const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mrc_foods';
const DB_RETRY_INTERVAL_MS = Number(process.env.DB_RETRY_INTERVAL_MS || 5000);

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

let isConnectingToDatabase = false;
let reconnectTimer = null;

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
SSE Setup
---------------------------------------
*/
const sseEmitter = new EventEmitter();
sseEmitter.setMaxListeners(0);

const sendSseEvent = (event, payload) => {
  sseEmitter.emit('message', { event, data: payload });
};

app.set('sendSseEvent', sendSseEvent);

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
SSE Endpoint
---------------------------------------
*/
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const sendEvent = (payload) => {
    const eventName = payload?.event || 'message';
    const data = payload?.data ?? {};
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent({ event: 'connected', data: { timestamp: new Date().toISOString() } });

  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 25000);

  sseEmitter.on('message', sendEvent);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseEmitter.off('message', sendEvent);
    res.end();
  });
});

/*
---------------------------------------
Static Files
---------------------------------------
*/
const UPLOADS_PATH = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOADS_PATH, {
  setHeaders: (res, path) => {
    // Allow images to be loaded from other origins (frontend dev server)
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

const FRONTEND_BUILD_PATH = path.join(__dirname, 'public');
const shouldServeFrontend = process.env.NODE_ENV === 'production';

if (shouldServeFrontend) {
  app.use(express.static(FRONTEND_BUILD_PATH));
}

/*
---------------------------------------
MongoDB Connection
---------------------------------------
*/
const scheduleReconnect = () => {
  if (reconnectTimer || isDatabaseConnected()) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectDB();
  }, DB_RETRY_INTERVAL_MS);
};

const connectDB = async () => {
  if (isDatabaseConnected() || isConnectingToDatabase) {
    return;
  }

  isConnectingToDatabase = true;

  try {
    console.log('DNS Servers:', dns.getServers());
    console.log('Mongo URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));

    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log(`Retrying MongoDB connection in ${DB_RETRY_INTERVAL_MS / 1000}s...`);
    scheduleReconnect();
  } finally {
    isConnectingToDatabase = false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Reconnecting...');
  scheduleReconnect();
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB runtime error:', error.message);
});

connectDB();

const requireDatabaseConnection = (req, res, next) => {
  if (isDatabaseConnected()) {
    return next();
  }

  return res.status(503).json({
    success: false,
    message: 'Database is unavailable. Please try again shortly.'
  });
};

/*
---------------------------------------
Socket.IO Events
---------------------------------------
*/
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('update-order-status', (data) => {
    console.log('Order status update:', data);

    io.emit('order-status-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

//Temp Comment
app.set('socketio', io);

/*
---------------------------------------
API Routes
---------------------------------------
*/
app.use(['/api/auth', '/api/menu', '/api/foods', '/api/orders', '/api/categories', '/api/users'], requireDatabaseConnection);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));

/*
---------------------------------------
Root Route (API Info)
---------------------------------------
*/
if (!shouldServeFrontend) {
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
        foods: '/api/foods',
        menu: '/api/menu',
        orders: '/api/orders'
      }
    });
  });
}

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
      isDatabaseConnected()
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
  console.error('Error:', err.stack);

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
  if (
    shouldServeFrontend &&
    req.method === 'GET' &&
    !req.path.startsWith('/api') &&
    req.accepts('html')
  ) {
    return res.sendFile(path.join(FRONTEND_BUILD_PATH, 'index.html'));
  }

  return res.status(404).json({
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
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`Socket.IO server running`);
});