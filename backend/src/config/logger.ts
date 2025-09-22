import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return msg;
  }),
);

const getLogLevel = (): string => {
  const level = process.env.LOG_LEVEL || 'info';
  return ['error', 'warn', 'info', 'debug'].includes(level) ? level : 'info';
};

export const logger = winston.createLogger({
  level: getLogLevel(),
  format: logFormat,
  defaultMeta: {
    service: 'project-recall-backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || 'unknown',
    pid: process.pid,
  },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
      silent: process.env.NODE_ENV === 'test',
    }),

    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, 
      maxFiles: 5,
      tailable: true,
    }),

    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, 
      maxFiles: 10,
      tailable: true,
    }),
  ],
  exitOnError: false,
});

export const createRequestLogger = () => {
  return (req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

      logger.log(logLevel, 'HTTP Request', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id,
      });
    });

    next();
  };
};

export const dbLogger = {
  query: (sql: string, params?: any[]) => {
    logger.debug('Database Query', {
      sql: sql.replace(/\s+/g, ' ').trim(),
      params,
      timestamp: new Date().toISOString(),
    });
  },

  error: (error: Error, sql?: string, params?: any[]) => {
    logger.error('Database Error', {
      error: error.message,
      stack: error.stack,
      sql: sql?.replace(/\s+/g, ' ').trim(),
      params,
    });
  },
};

export const socketLogger = {
  connection: (socketId: string, userId?: string) => {
    logger.info('Socket Connection', {
      socketId,
      userId,
      event: 'connect',
    });
  },

  disconnection: (socketId: string, reason: string, userId?: string) => {
    logger.info('Socket Disconnection', {
      socketId,
      userId,
      reason,
      event: 'disconnect',
    });
  },

  event: (socketId: string, event: string, data?: any, userId?: string) => {
    logger.debug('Socket Event', {
      socketId,
      userId,
      event,
      data: data ? JSON.stringify(data).substring(0, 1000) : undefined,
    });
  },

  error: (socketId: string, error: Error, userId?: string) => {
    logger.error('Socket Error', {
      socketId,
      userId,
      error: error.message,
      stack: error.stack,
    });
  },
};

export const performanceLogger = {
  startTimer: (operation: string) => {
    const start = Date.now();

    return {
      end: (metadata?: Record<string, any>) => {
        const duration = Date.now() - start;
        const logLevel = duration > 1000 ? 'warn' : 'info';

        logger.log(logLevel, 'Performance Metric', {
          operation,
          duration: `${duration}ms`,
          ...metadata,
        });
      },
    };
  },

  memory: () => {
    const usage = process.memoryUsage();
    logger.info('Memory Usage', {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
    });
  },
};

export const securityLogger = {
  authFailure: (email: string, ip: string, reason: string) => {
    logger.warn('Authentication Failure', {
      email,
      ip,
      reason,
      event: 'auth_failure',
    });
  },

  suspiciousActivity: (userId: string, activity: string, ip: string, metadata?: Record<string, any>) => {
    logger.warn('Suspicious Activity', {
      userId,
      activity,
      ip,
      event: 'suspicious_activity',
      ...metadata,
    });
  },

  rateLimitExceeded: (ip: string, endpoint: string) => {
    logger.warn('Rate Limit Exceeded', {
      ip,
      endpoint,
      event: 'rate_limit_exceeded',
    });
  },
};

export const lifecycleLogger = {
  startup: (port: number, environment: string) => {
    logger.info('Application Started', {
      port,
      environment,
      nodeVersion: process.version,
      event: 'startup',
    });
  },

  shutdown: (reason: string) => {
    logger.info('Application Shutdown', {
      reason,
      event: 'shutdown',
    });
  },

  healthCheck: (status: 'healthy' | 'unhealthy', checks: Record<string, boolean>) => {
    const logLevel = status === 'healthy' ? 'info' : 'error';
    logger.log(logLevel, 'Health Check', {
      status,
      checks,
      event: 'health_check',
    });
  },
};

import { mkdirSync } from 'fs';
try {
  mkdirSync('logs', { recursive: true });
} catch (error) {
}

export default logger;