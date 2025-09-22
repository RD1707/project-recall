import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { Environment } from '@/types';
import { logger } from '@/config/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

import authRoutes from '@/routes/authRoutes';
import deckRoutes from '@/routes/deckRoutes';
import flashcardRoutes from '@/routes/flashcardRoutes';
import profileRoutes from '@/routes/profileRoutes';
import analyticsRoutes from '@/routes/analyticsRoutes';
import shareRoutes from '@/routes/shareRoutes';
import achievementRoutes from '@/routes/achievementRoutes';
import communityRoutes from '@/routes/communityRoutes';
import healthRoutes from '@/routes/healthRoutes';

import { quizSocketHandler } from '@/socket/quizSocketHandler';

config();

const validateEnvironment = (): Environment => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'REDIS_URL',
    'COHERE_API_KEY',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT ?? '3001', 10),
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    REDIS_URL: process.env.REDIS_URL!,
    COHERE_API_KEY: process.env.COHERE_API_KEY!,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10),
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['pdf', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
    CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10),
    LOG_LEVEL: (process.env.LOG_LEVEL as Environment['LOG_LEVEL']) || 'info',
    SENTRY_DSN: process.env.SENTRY_DSN,
  };
};

const env = validateEnvironment();

const app: Application = express();

const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:'],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
  });

  next();
});

app.use('/api/health', healthRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/community', communityRoutes);

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`, {
    socketId: socket.id,
    userAgent: socket.handshake.headers['user-agent'],
    ip: socket.handshake.address,
  });

  quizSocketHandler(io, socket);

  socket.on('disconnect', (reason) => {
    logger.info(`User disconnected: ${socket.id}`, {
      socketId: socket.id,
      reason,
    });
  });

  socket.on('error', (error) => {
    logger.error(`Socket error: ${socket.id}`, {
      socketId: socket.id,
      error: error.message,
      stack: error.stack,
    });
  });
});

if (env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDistPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
  }));

  app.get('*', (req: Request, res: Response) => {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

const gracefulShutdown = (signal: string): void => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }

    logger.info('Server closed successfully');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', {
    promise,
    reason,
  });
  process.exit(1);
});

server.listen(env.PORT, () => {
  logger.info(`🚀 Server and WebSocket running on port ${env.PORT}`, {
    port: env.PORT,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default app;