import { config } from 'dotenv';
import { Worker, Job } from 'bullmq';
import { logger, performanceLogger } from '@/config/logger';
import { connection, isRedisConnected } from '@/config/queue';
import { supabase } from '@/config/supabaseClient';
import { FileProcessingJob, Flashcard, CardType } from '@/types';

const { generateFlashcardsFromText } = require('./services/cohereService');

config();

interface FlashcardGenerationJobData {
  deckId: string;
  userId: string;
  textContent: string;
  count: number;
  type: CardType;
  jobId?: string;
  priority?: number;
}

interface FlashcardGenerationResult {
  success: boolean;
  count: number;
  flashcards?: Partial<Flashcard>[];
  error?: string;
}

interface GeneratedFlashcard {
  question: string;
  answer: string;
  options?: any[];
}

const QUEUE_NAME = 'flashcardGeneration';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; 

class FlashcardWorker {
  private worker: Worker | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (!connection) {
      logger.warn(' Redis is not available. Worker will not start.');
      process.exit(0);
    }

    if (!isRedisConnected()) {
      logger.warn(' Redis connection is not ready. Waiting for connection...');
      setTimeout(() => this.initialize(), 5000);
      return;
    }

    logger.info(`Starting worker for queue "${QUEUE_NAME}"...`);

    this.worker = new Worker<FlashcardGenerationJobData, FlashcardGenerationResult>(
      QUEUE_NAME,
      this.processJob.bind(this),
      {
        connection,
        concurrency: 3, 
        removeOnComplete: 100, 
        removeOnFail: 50, 
        settings: {
          stalledInterval: 30000, 
          maxStalledCount: 3,
        },
      }
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.worker) return;

    this.worker.on('completed', (job: Job, result: FlashcardGenerationResult) => {
      logger.info('Job completed successfully', {
        jobId: job.id,
        deckId: job.data.deckId,
        userId: job.data.userId,
        flashcardsCount: result.count,
        duration: Date.now() - job.processedOn!,
      });
    });

    this.worker.on('failed', (job: Job | undefined, error: Error) => {
      logger.error('Job failed', {
        jobId: job?.id,
        deckId: job?.data?.deckId,
        userId: job?.data?.userId,
        error: error.message,
        attempts: job?.attemptsMade,
        maxAttempts: job?.opts.attempts,
        stack: error.stack,
      });
    });

    this.worker.on('stalled', (jobId: string) => {
      logger.warn('Job stalled', {
        jobId,
        message: 'Job has been stalled and will be retried',
      });
    });

    this.worker.on('progress', (job: Job, progress: number) => {
      logger.debug('Job progress', {
        jobId: job.id,
        progress: `${progress}%`,
        deckId: job.data.deckId,
      });
    });

    this.worker.on('error', (error: Error) => {
      logger.error('Worker error', {
        error: error.message,
        stack: error.stack,
      });
    });

    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
  }

  private async processJob(job: Job<FlashcardGenerationJobData>): Promise<FlashcardGenerationResult> {
    const timer = performanceLogger.startTimer('flashcard-generation');
    const { deckId, userId, textContent, count, type } = job.data;

    logger.info('Processing flashcard generation job', {
      jobId: job.id,
      deckId,
      userId,
      textLength: textContent.length,
      requestedCount: count,
      cardType: type,
    });

    try {
      this.validateJobData(job.data);

      await job.updateProgress(10);

      logger.debug('Generating flashcards with AI service', {
        jobId: job.id,
        deckId,
      });

      const generatedFlashcards: GeneratedFlashcard[] = await generateFlashcardsFromText(
        textContent,
        count,
        type
      );

      if (!generatedFlashcards || generatedFlashcards.length === 0) {
        throw new Error('AI service failed to generate flashcards');
      }

      await job.updateProgress(50);

      const flashcardsToSave = generatedFlashcards.map((card: GeneratedFlashcard) => ({
        deck_id: deckId,
        question: card.question,
        answer: card.answer,
        options: card.options || null,
        card_type: type,
        repetition: 0,
        ease_factor: 2.5,
        interval: 1,
        due_date: new Date().toISOString(),
      }));

      await job.updateProgress(70);

      logger.debug('Saving flashcards to database', {
        jobId: job.id,
        deckId,
        count: flashcardsToSave.length,
      });

      const { data: savedFlashcards, error: saveError } = await supabase
        .from('flashcards')
        .insert(flashcardsToSave)
        .select();

      if (saveError) {
        logger.error('Database error saving flashcards', {
          jobId: job.id,
          deckId,
          error: saveError.message,
          details: saveError.details,
        });
        throw new Error(`Database error: ${saveError.message}`);
      }

      await job.updateProgress(100);

      timer.end({
        jobId: job.id,
        deckId,
        flashcardsGenerated: savedFlashcards.length,
        success: true,
      });

      logger.info('Job completed successfully', {
        jobId: job.id,
        deckId,
        userId,
        flashcardsCount: savedFlashcards.length,
      });

      return {
        success: true,
        count: savedFlashcards.length,
        flashcards: savedFlashcards,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      timer.end({
        jobId: job.id,
        deckId,
        success: false,
        error: errorMessage,
      });

      logger.error('Job processing failed', {
        jobId: job.id,
        deckId,
        userId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  }

  private validateJobData(data: FlashcardGenerationJobData): void {
    if (!data.deckId || typeof data.deckId !== 'string') {
      throw new Error('Invalid or missing deck ID');
    }

    if (!data.userId || typeof data.userId !== 'string') {
      throw new Error('Invalid or missing user ID');
    }

    if (!data.textContent || typeof data.textContent !== 'string' || data.textContent.trim().length === 0) {
      throw new Error('Invalid or empty text content');
    }

    if (!data.count || typeof data.count !== 'number' || data.count <= 0 || data.count > 50) {
      throw new Error('Invalid flashcard count (must be between 1 and 50)');
    }

    if (!data.type || !Object.values(CardType).includes(data.type)) {
      throw new Error('Invalid card type');
    }

    if (data.textContent.length > 50000) {
      throw new Error('Text content too long (maximum 50,000 characters)');
    }

    if (data.textContent.length < 100) {
      throw new Error('Text content too short (minimum 100 characters)');
    }
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}. Starting graceful worker shutdown...`);

    if (this.worker) {
      try {
        await this.worker.close();
        logger.info('Worker closed successfully');
      } catch (error) {
        logger.error('Error closing worker:', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    process.exit(0);
  }

  public async getWorkerStatus(): Promise<{
    isRunning: boolean;
    redisConnected: boolean;
    queueName: string;
  }> {
    return {
      isRunning: this.worker !== null,
      redisConnected: isRedisConnected(),
      queueName: QUEUE_NAME,
    };
  }
}

const flashcardWorker = new FlashcardWorker();

export { flashcardWorker };
export default flashcardWorker;