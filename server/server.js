const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ─── CORS helper ──────────────────────────────────────────────────────────────
// Accept any localhost origin (handles port variations like 5173, 5174, etc.)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost or 127.0.0.1 origin
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin === (process.env.CLIENT_URL || 'http://localhost:5173')
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      callback(new Error(`Socket CORS blocked: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// ─── Middleware ────────────────────────────────────────────────────────────────
const cookieParser = require('cookie-parser');
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Setup structured logging (morgan)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

// Setup Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api', require('./routes/scamRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/url', require('./routes/urlRoutes'));
app.use('/api/ocr', require('./routes/ocrRoutes'));
app.use('/api/chat', require('./routes/chatbotRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'Connected' : dbState === 2 ? 'Connecting' : 'Disconnected';
  
  res.json({ 
    status: 'UP', 
    database: dbStatus, 
    serverTime: new Date().toISOString() 
  });
});

// ─── Serve Frontend ───────────────────────────────────────────────────────────
// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route to serve the frontend's index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ─── Socket.io Real-Time Events ───────────────────────────────────────────────
const connectedUsers = new Map(); // socketId -> { userId, role }

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  const broadcastOnlineStats = () => {
    let admins = 0;
    let users = 0;
    for (const data of connectedUsers.values()) {
      if (data.role === 'admin') admins++;
      else users++;
    }
    io.to('admins').emit('online_stats', { users, admins, total: connectedUsers.size });
    io.to('admins').emit('online_count', connectedUsers.size); // Legacy compatibility
  };

  // User identifies themselves after connecting
  socket.on('identify', ({ userId, role }) => {
    connectedUsers.set(socket.id, { userId, role });
    socket.join(`user_${userId}`);
    if (role === 'admin') {
      socket.join('admins');
    }
    console.log(`[Socket] User identified: ${userId} (${role})`);

    // Send current online stats to admins
    broadcastOnlineStats();
  });

  // Admin sends a manual alert
  socket.on('send_alert', (data) => {
    io.emit('receive_alert', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  // Admin sends alert to specific user
  socket.on('send_user_alert', ({ userId, notification }) => {
    io.to(`user_${userId}`).emit('admin_notification', notification);
  });

  // Ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    broadcastOnlineStats();
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🛡️  CyberShield Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🗄️  MongoDB connecting...\n`);
});
