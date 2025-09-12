const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");
const fs = require('fs');

const authRoutes = require('./src/routes/authRoutes');
const deckRoutes = require('./src/routes/deckRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const shareRoutes = require('./src/routes/shareRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');
const communityRoutes = require('./src/routes/communityRoutes');
const quizSocketHandler = require('./src/socket/quizSocketHandler');
const logger = require('./src/config/logger');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.set('trust proxy', 1);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors());
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  next();
});

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(err.statusCode || 500).json({
    error: isDevelopment ? err.message : 'Erro interno do servidor',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && { stack: err.stack })
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/decks/:deckId/flashcards', flashcardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', shareRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/community', communityRoutes);

io.on('connection', (socket) => {
  logger.info('User connected to socket', {
    socketId: socket.id,
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent']
  });

  quizSocketHandler(io, socket);

  socket.on('disconnect', (reason) => {
    logger.info('User disconnected from socket', {
      socketId: socket.id,
      reason: reason
    });
  });

  socket.on('error', (error) => {
    logger.error(`Socket error: ${error.message}`, {
      socketId: socket.id,
      error: error.stack
    });
  });
});

const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
    logger.warn('Frontend build directory not found, serving API only.', { path: frontendDistPath });
}

app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint de API não encontrado',
    code: 'API_ENDPOINT_NOT_FOUND',
    path: req.originalUrl
  });
});

server.listen(PORT, () => {
  logger.info(`Server and WebSocket running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid
  });
});

module.exports = app;