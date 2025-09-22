import { config } from 'dotenv';
import { z } from 'zod';
import { Environment } from '@/types';

config();

const truthyString = z.string().transform(val => val === 'true').pipe(z.boolean());

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(65535)).default('3001'),

  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  REDIS_URL: z.string().url('REDIS_URL must be a valid URL'),

  COHERE_API_KEY: z.string().min(1, 'COHERE_API_KEY is required'),

  DATABASE_URL: z.string().url().optional(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),

  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(val => parseInt(val, 10)).pipe(z.number().positive()).default('10485760'),
  ALLOWED_FILE_TYPES: z.string().default('pdf,docx,txt,jpg,jpeg,png').transform(val => val.split(',')).pipe(z.array(z.string())),

  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000').transform(val => val.split(',')).pipe(z.array(z.string())),

  RATE_LIMIT_WINDOW_MS: z.string().transform(val => parseInt(val, 10)).pipe(z.number().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).pipe(z.number().positive()).default('100'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  SENTRY_DSN: z.string().url().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(65535)).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  SSL_CERT_PATH: z.string().optional(),
  SSL_KEY_PATH: z.string().optional(),

  CDN_URL: z.string().url().optional(),

  GOOGLE_ANALYTICS_ID: z.string().optional(),

  ENABLE_REGISTRATION: truthyString.default('true'),
  ENABLE_FILE_UPLOAD: truthyString.default('true'),
  ENABLE_AI_GENERATION: truthyString.default('true'),
  ENABLE_COMMUNITY_FEATURES: truthyString.default('true'),
  ENABLE_ANALYTICS: truthyString.default('true'),
});

export const validateEnvironment = (): Environment => {
  try {
    const parsed = environmentSchema.parse(process.env);

    if (parsed.NODE_ENV === 'production') {
      if (!parsed.JWT_SECRET) {
        throw new Error('JWT_SECRET is required in production');
      }

      if (!parsed.SENTRY_DSN) {
        console.warn(' SENTRY_DSN not configured for production monitoring');
      }

      if (parsed.CORS_ORIGIN.includes('http://localhost:5173')) {
        console.warn(' Localhost URLs in CORS_ORIGIN for production environment');
      }
    }

    return parsed as Environment;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');

      throw new Error(`Environment validation failed:\n${errorMessages}`);
    }

    throw error;
  }
};

class EnvironmentConfig {
  private static instance: Environment;

  public static getInstance(): Environment {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = validateEnvironment();
    }

    return EnvironmentConfig.instance;
  }

  public static reload(): Environment {
    config();
    EnvironmentConfig.instance = validateEnvironment();
    return EnvironmentConfig.instance;
  }

  public static isDevelopment(): boolean {
    return this.getInstance().NODE_ENV === 'development';
  }

  public static isProduction(): boolean {
    return this.getInstance().NODE_ENV === 'production';
  }

  public static isTest(): boolean {
    return this.getInstance().NODE_ENV === 'test';
  }

  public static getFeatureFlags(): Record<string, boolean> {
    const env = this.getInstance();
    return {
      ENABLE_REGISTRATION: env.ENABLE_REGISTRATION,
      ENABLE_FILE_UPLOAD: env.ENABLE_FILE_UPLOAD,
      ENABLE_AI_GENERATION: env.ENABLE_AI_GENERATION,
      ENABLE_COMMUNITY_FEATURES: env.ENABLE_COMMUNITY_FEATURES,
      ENABLE_ANALYTICS: env.ENABLE_ANALYTICS,
    };
  }

  public static getSecurityConfig() {
    const env = this.getInstance();
    return {
      jwtSecret: env.JWT_SECRET,
      corsOrigin: env.CORS_ORIGIN,
      rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
      rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    };
  }

  public static getDatabaseConfig() {
    const env = this.getInstance();
    return {
      supabaseUrl: env.SUPABASE_URL,
      supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      databaseUrl: env.DATABASE_URL,
      redisUrl: env.REDIS_URL,
    };
  }

  public static getFileUploadConfig(): {
    uploadDir: string;
    maxFileSize: number;
    allowedFileTypes: string[];
  } {
    const env = this.getInstance();
    return {
      uploadDir: env.UPLOAD_DIR,
      maxFileSize: env.MAX_FILE_SIZE,
      allowedFileTypes: env.ALLOWED_FILE_TYPES,
    };
  }

  public static getAIConfig(): {
    cohereApiKey: string;
  } {
    const env = this.getInstance();
    return {
      cohereApiKey: env.COHERE_API_KEY,
    };
  }

  public static getMonitoringConfig() {
    const env = this.getInstance();
    return {
      logLevel: env.LOG_LEVEL,
      sentryDsn: env.SENTRY_DSN,
    };
  }
}

export const env = EnvironmentConfig.getInstance();
export { EnvironmentConfig };

export const environmentConfig = {
  app: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  },
  database: EnvironmentConfig.getDatabaseConfig(),
  security: EnvironmentConfig.getSecurityConfig(),
  fileUpload: EnvironmentConfig.getFileUploadConfig(),
  ai: EnvironmentConfig.getAIConfig(),
  monitoring: EnvironmentConfig.getMonitoringConfig(),
  features: EnvironmentConfig.getFeatureFlags(),
};

try {
  validateEnvironment();
  console.log('Environment configuration validated successfully');
} catch (error) {
  console.error('Environment configuration validation failed:', error);
  process.exit(1);
}