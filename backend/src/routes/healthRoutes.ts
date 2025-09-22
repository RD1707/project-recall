import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { logger, lifecycleLogger } from '@/config/logger';
import { ApiResponse } from '@/types';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const checks: Record<string, boolean> = {};
  let overallStatus: 'healthy' | 'unhealthy' = 'healthy';

  // Check Supabase connection
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      );

      const { error } = await supabase.from('profiles').select('count').limit(1);
      checks.supabase = !error;
    } else {
      checks.supabase = false;
    }
  } catch (error) {
    checks.supabase = false;
    logger.error('Supabase health check failed', { error });
  }

  // Check Redis connection
  try {
    if (process.env.REDIS_URL) {
      const redis = new Redis(process.env.REDIS_URL);
      await redis.ping();
      checks.redis = true;
      redis.disconnect();
    } else {
      checks.redis = false;
    }
  } catch (error) {
    checks.redis = false;
    logger.error('Redis health check failed', { error });
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const maxHeapUsed = 1024 * 1024 * 1024; // 1GB limit
  checks.memory = memUsage.heapUsed < maxHeapUsed;

  // Check disk space (simplified)
  checks.disk = true; // Would implement actual disk space check in production

  // Check environment variables
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'REDIS_URL',
    'COHERE_API_KEY',
  ];

  checks.environment = requiredEnvVars.every(varName => !!process.env[varName]);

  // Overall status
  overallStatus = Object.values(checks).every(Boolean) ? 'healthy' : 'unhealthy';

  // Log health check result
  lifecycleLogger.healthCheck(overallStatus, checks);

  const response: ApiResponse<{
    status: string;
    timestamp: string;
    uptime: number;
    checks: Record<string, boolean>;
    version: string;
    environment: string;
    memory: {
      used: string;
      total: string;
      percentage: string;
    };
  }> = {
    success: overallStatus === 'healthy',
    data: {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        percentage: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`,
      },
    },
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json(response);
});

// Detailed health check endpoint
router.get('/detailed', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const checks: Record<string, {
    status: boolean;
    responseTime?: number;
    error?: string;
    details?: any;
  }> = {};

  // Supabase detailed check
  const supabaseStart = Date.now();
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      );

      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      checks.supabase = {
        status: !error,
        responseTime: Date.now() - supabaseStart,
        error: error?.message,
        details: { recordCount: data?.length || 0 },
      };
    } else {
      checks.supabase = {
        status: false,
        error: 'Missing Supabase configuration',
      };
    }
  } catch (error: any) {
    checks.supabase = {
      status: false,
      responseTime: Date.now() - supabaseStart,
      error: error.message,
    };
  }

  // Redis detailed check
  const redisStart = Date.now();
  try {
    if (process.env.REDIS_URL) {
      const redis = new Redis(process.env.REDIS_URL);
      const info = await redis.info();
      const keyCount = await redis.dbsize();

      checks.redis = {
        status: true,
        responseTime: Date.now() - redisStart,
        details: {
          keyCount,
          memory: info.split('\r\n').find(line => line.startsWith('used_memory_human:'))?.split(':')[1],
        },
      };

      redis.disconnect();
    } else {
      checks.redis = {
        status: false,
        error: 'Missing Redis configuration',
      };
    }
  } catch (error: any) {
    checks.redis = {
      status: false,
      responseTime: Date.now() - redisStart,
      error: error.message,
    };
  }

  // System metrics
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  checks.system = {
    status: true,
    details: {
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  };

  const totalResponseTime = Date.now() - startTime;
  const overallStatus = Object.values(checks).every(check => check.status);

  const response: ApiResponse = {
    success: overallStatus,
    data: {
      status: overallStatus ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      totalResponseTime: `${totalResponseTime}ms`,
      checks,
    },
  };

  const statusCode = overallStatus ? 200 : 503;
  res.status(statusCode).json(response);
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req: Request, res: Response): Promise<void> => {
  // Check if the application is ready to serve traffic
  const checks = {
    database: false,
    cache: false,
  };

  // Quick database check
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      );

      const { error } = await supabase.from('profiles').select('count').limit(1);
      checks.database = !error;
    }
  } catch {
    checks.database = false;
  }

  // Quick cache check
  try {
    if (process.env.REDIS_URL) {
      const redis = new Redis(process.env.REDIS_URL);
      await redis.ping();
      checks.cache = true;
      redis.disconnect();
    }
  } catch {
    checks.cache = false;
  }

  const isReady = Object.values(checks).every(Boolean);
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    success: isReady,
    data: {
      ready: isReady,
      checks,
    },
  });
});

// Liveness probe (for Kubernetes)
router.get('/live', (req: Request, res: Response): void => {
  // Check if the application is alive (basic functionality)
  const response: ApiResponse = {
    success: true,
    data: {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };

  res.status(200).json(response);
});

export default router;