import { Queue } from 'bullmq';
import IORedis, { Redis } from 'ioredis';
import { logger } from '@/config/logger';
import { environmentConfig } from '@/config/environment';

// Types for queue configuration
interface QueueConnection {
  flashcardGenerationQueue: Queue | null;
  connection: Redis | null;
  isRedisConnected: boolean;
}

// Queue configuration class
class QueueManager {
  private static instance: QueueManager;
  private flashcardGenerationQueue: Queue | null = null;
  private connection: Redis | null = null;
  private isConnected: boolean = false;
  private hasLoggedConnection: boolean = false;

  private constructor() {
    this.initializeConnection();
  }

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  private initializeConnection(): void {
    const redisUrl = environmentConfig.database.redisUrl;

    if (!redisUrl || redisUrl === 'DISABLED') {
      logger.warn('⚠️  Redis is disabled or not configured. AI generation will be synchronous.');
      return;
    }

    try {
      this.connection = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        connectTimeout: 5000,
        retryDelayOnFailover: 100,
        lazyConnect: true,
        keepAlive: 30000,
        commandTimeout: 5000,
        // Connection pool settings
        family: 4,
        enableReadyCheck: false,
        maxLoadingTimeout: 5000,
      });

      this.setupEventHandlers();
      this.flashcardGenerationQueue = new Queue('flashcardGeneration', {
        connection: this.connection,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      });

      logger.info('Queue manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Redis connection:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        redisUrl: redisUrl.replace(/\/\/.*@/, '//***@'), // Hide credentials in logs
      });
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.on('connect', () => {
      if (!this.hasLoggedConnection) {
        logger.info('Successfully connected to Redis', {
          host: this.connection?.options.host,
          port: this.connection?.options.port,
        });
        this.hasLoggedConnection = true;
      }
      this.isConnected = true;
    });

    this.connection.on('ready', () => {
      logger.info('Redis connection is ready');
      this.isConnected = true;
    });

    this.connection.on('error', (error: Error) => {
      logger.error('Redis connection error:', {
        error: error.message,
        stack: error.stack,
      });
      this.isConnected = false;
      this.hasLoggedConnection = false;
    });

    this.connection.on('close', () => {
      logger.warn('Redis connection closed');
      this.isConnected = false;
    });

    this.connection.on('reconnecting', () => {
      logger.info('Reconnecting to Redis...');
    });
  }

  public getFlashcardGenerationQueue(): Queue | null {
    return this.flashcardGenerationQueue;
  }

  public getConnection(): Redis | null {
    return this.connection;
  }

  public get isRedisConnected(): boolean {
    return this.isConnected &&
           this.connection !== null &&
           this.connection.status === 'ready';
  }

  public async healthCheck(): Promise<{
    connected: boolean;
    status: string;
    queueStatus: string;
  }> {
    try {
      if (!this.connection) {
        return {
          connected: false,
          status: 'not_configured',
          queueStatus: 'unavailable',
        };
      }

      await this.connection.ping();

      return {
        connected: this.isRedisConnected,
        status: this.connection.status,
        queueStatus: this.flashcardGenerationQueue ? 'available' : 'unavailable',
      };
    } catch (error) {
      logger.error('Redis health check failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        connected: false,
        status: 'error',
        queueStatus: 'unavailable',
      };
    }
  }

  public async gracefulShutdown(): Promise<void> {
    logger.info('Shutting down queue manager...');

    try {
      if (this.flashcardGenerationQueue) {
        await this.flashcardGenerationQueue.close();
        logger.info('Flashcard generation queue closed');
      }

      if (this.connection) {
        await this.connection.quit();
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error during queue manager shutdown:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Export singleton instance and utilities
const queueManager = QueueManager.getInstance();

export const flashcardGenerationQueue = queueManager.getFlashcardGenerationQueue();
export const connection = queueManager.getConnection();
export const isRedisConnected = (): boolean => queueManager.isRedisConnected;
export const queueHealthCheck = (): Promise<ReturnType<QueueManager['healthCheck']>> =>
  queueManager.healthCheck();
export const gracefulShutdown = (): Promise<void> => queueManager.gracefulShutdown();

// Default export for backward compatibility
export default {
  flashcardGenerationQueue,
  connection,
  get isRedisConnected() {
    return queueManager.isRedisConnected;
  },
  healthCheck: queueHealthCheck,
  gracefulShutdown,
};