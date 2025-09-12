const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");

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

// Configurações de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitado para desenvolvimento
  crossOriginEmbedderPolicy: false
}));

// Trust proxy para obter IPs corretos quando atrás de proxy
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

// Middleware de parsing com limites de segurança
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

// Middleware de logging para todas as requisições
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

// Middleware para tratamento de erros não capturados
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Não vazar detalhes do erro em produção
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.statusCode || 500).json({
    error: isDevelopment ? err.message : 'Erro interno do servidor',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Health check endpoint
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
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', shareRoutes); 
app.use('/api/achievements', achievementRoutes);
app.use('/api/community', communityRoutes);

// Socket.IO com tratamento de erros robusto
io.on('connection', (socket) => {
  logger.info('User connected to socket', { 
    socketId: socket.id,
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent']
  });

  // Wrapper para tratamento de erros em handlers
  const safeHandler = (handler) => {
    return (...args) => {
      try {
        handler(...args);
      } catch (error) {
        logger.error(`Socket handler error: ${error.message}`, {
          socketId: socket.id,
          error: error.stack
        });
        socket.emit('error', { message: 'Erro interno do servidor' });
      }
    };
  };

  // Aplicar o wrapper ao handler do quiz
  try {
    quizSocketHandler(io, socket);
  } catch (error) {
    logger.error(`Error initializing quiz socket handler: ${error.message}`, {
      socketId: socket.id,
      error: error.stack
    });
  }

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

// Servir arquivos estáticos com fallback robusto
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');

// Verificar se o diretório de build existe
const fs = require('fs');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    etag: true
  }));

  // SPA fallback - deve vir após todas as rotas de API
  app.get('*', (req, res, next) => {
    // Ignorar rotas de API
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    const indexPath = path.join(frontendDistPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      logger.error('Frontend build not found', { path: indexPath });
      res.status(404).json({ 
        error: 'Frontend não encontrado. Execute o build primeiro.',
        code: 'FRONTEND_NOT_FOUND'
      });
    }
  });
} else {
  logger.warn('Frontend build directory not found', { path: frontendDistPath });
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        error: 'Endpoint não encontrado',
        code: 'ENDPOINT_NOT_FOUND'
      });
    }
    
    res.status(503).json({ 
      error: 'Frontend não disponível. Execute o build primeiro.',
      code: 'FRONTEND_NOT_AVAILABLE'
    });
  });
}

// Middleware para capturar 404s em rotas de API não encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint de API não encontrado',
    code: 'API_ENDPOINT_NOT_FOUND',
    path: req.originalUrl
  });
});

// Tratamento de erros não capturados globalmente
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, {
    stack: error.stack,
    pid: process.pid
  });
  
  // Dar tempo para logs serem escritos antes de sair
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason}`, {
    promise: promise,
    pid: process.pid
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Forçar saída após timeout
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  logger.info(`Server and WebSocket running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid
  });
});

// Export para testes
module.exports = app;