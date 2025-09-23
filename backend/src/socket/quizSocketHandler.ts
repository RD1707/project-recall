import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger, socketLogger } from '@/config/logger';
import { CustomError, ValidationError } from '@/middleware/errorHandler';
import { SocketUser, QuizRoom } from '@/types';
import * as quizService from '../services/quizService';

const NEXT_QUESTION_DELAY = 4000;

interface CreateQuizData {
  deckId: string;
  user: SocketUser;
}

interface JoinQuizData {
  roomId: string;
  user: SocketUser;
}

interface StartQuizData {
  roomId: string;
}

interface SubmitAnswerData {
  roomId: string;
  answer: string;
}

interface SocketCallback<T = Record<string, unknown>> {
  (response: { success: boolean; message?: string; quiz?: QuizRoom; roomId?: string } & T): void;
}

const validateUser = (user: unknown): user is SocketUser => {
  return user &&
         typeof user.id === 'string' &&
         typeof user.username === 'string' &&
         user.id.length > 0 &&
         user.username.length > 0;
};

const validateCreateQuizData = (data: unknown): data is CreateQuizData => {
  return data &&
         typeof data.deckId === 'string' &&
         data.deckId.length > 0 &&
         validateUser(data.user);
};

const validateJoinQuizData = (data: unknown): data is JoinQuizData => {
  return data &&
         typeof data.roomId === 'string' &&
         data.roomId.length > 0 &&
         validateUser(data.user);
};

const validateStartQuizData = (data: unknown): data is StartQuizData => {
  return data &&
         typeof data.roomId === 'string' &&
         data.roomId.length > 0;
};

const validateSubmitAnswerData = (data: unknown): data is SubmitAnswerData => {
  return data &&
         typeof data.roomId === 'string' &&
         typeof data.answer === 'string' &&
         data.roomId.length > 0 &&
         data.answer.length > 0;
};

class QuizSocketHandler {
  private io: SocketIOServer;
  private socket: Socket;

  constructor(io: SocketIOServer, socket: Socket) {
    this.io = io;
    this.socket = socket;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.socket.on('quiz:create', this.handleCreateQuiz.bind(this));
    this.socket.on('quiz:join', this.handleJoinQuiz.bind(this));
    this.socket.on('quiz:start', this.handleStartQuiz.bind(this));
    this.socket.on('quiz:submit_answer', this.handleSubmitAnswer.bind(this));
  }

  private async handleCreateQuiz(data: unknown, callback: SocketCallback): Promise<void> {
    const userId = this.getUserId();

    try {
      if (!validateCreateQuizData(data)) {
        throw new ValidationError('Invalid user information for creating quiz');
      }

      const { deckId, user } = data;
      const hostUser: SocketUser & { socketId: string } = {
        ...user,
        socketId: this.socket.id,
      };

      socketLogger.event(this.socket.id, 'quiz:create', { deckId, userId: user.id }, userId);

      const { quiz, roomId } = await quizService.createQuiz(deckId, hostUser);

      await this.socket.join(roomId);

      logger.info('User created and joined quiz room', {
        username: hostUser.username,
        userId: hostUser.id,
        socketId: this.socket.id,
        roomId,
        deckId,
      });

      callback({
        success: true,
        quiz,
        roomId
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error creating quiz';

      socketLogger.error(this.socket.id, error as Error, userId);
      logger.error('Error creating quiz', {
        socketId: this.socket.id,
        userId,
        error: errorMessage,
        data,
      });

      callback({
        success: false,
        message: errorMessage
      });
    }
  }

  private handleJoinQuiz(data: unknown, callback: SocketCallback): void {
    const userId = this.getUserId();

    try {
      if (!validateJoinQuizData(data)) {
        throw new ValidationError('Invalid user information for joining quiz');
      }

      const { roomId, user } = data;
      const playerWithSocketId: SocketUser & { socketId: string } = {
        ...user,
        socketId: this.socket.id,
      };

      socketLogger.event(this.socket.id, 'quiz:join', { roomId, userId: user.id }, userId);

      const updatedQuiz = quizService.joinQuiz(roomId, playerWithSocketId);

      this.socket.join(roomId);

      logger.info('User joined quiz room', {
        username: user.username,
        userId: user.id,
        socketId: this.socket.id,
        roomId,
      });

      this.io.to(roomId).emit('quiz:updated', updatedQuiz);

      callback({
        success: true,
        quiz: updatedQuiz
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error joining quiz';

      socketLogger.error(this.socket.id, error as Error, userId);
      logger.error('Error joining quiz', {
        socketId: this.socket.id,
        userId,
        error: errorMessage,
        data,
      });

      callback({
        success: false,
        message: errorMessage
      });
    }
  }

  private handleStartQuiz(data: unknown): void {
    const userId = this.getUserId();

    try {
      if (!validateStartQuizData(data)) {
        throw new ValidationError('Invalid room ID for starting quiz');
      }

      const { roomId } = data;
      const hostId = this.socket.id;

      socketLogger.event(this.socket.id, 'quiz:start', { roomId }, userId);

      const { quiz, currentQuestion } = quizService.startQuiz(roomId, hostId);

      logger.info('Quiz started', {
        socketId: this.socket.id,
        userId,
        roomId,
        totalQuestions: quiz.questions.length,
      });

      this.io.to(roomId).emit('quiz:started', { quiz });
      this.io.to(roomId).emit('quiz:question', {
        question: currentQuestion,
        questionIndex: quiz.currentQuestionIndex,
        totalQuestions: quiz.questions.length,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error starting quiz';

      socketLogger.error(this.socket.id, error as Error, userId);
      logger.error('Error starting quiz', {
        socketId: this.socket.id,
        userId,
        error: errorMessage,
        data,
      });

      this.socket.emit('quiz:error', {
        message: errorMessage
      });
    }
  }

  private handleSubmitAnswer(data: unknown): void {
    const userId = this.getUserId();

    try {
      if (!validateSubmitAnswerData(data)) {
        throw new ValidationError('Invalid answer submission data');
      }

      const { roomId, answer } = data;

      socketLogger.event(this.socket.id, 'quiz:submit_answer', { roomId, answer }, userId);

      const updatedQuiz = quizService.submitAnswer(roomId, this.socket.id, answer);
      const currentQuestion = updatedQuiz.questions[updatedQuiz.currentQuestionIndex];

      logger.debug('Answer submitted', {
        socketId: this.socket.id,
        userId,
        roomId,
        answer,
        correct: answer === currentQuestion.answer,
      });

      this.io.to(roomId).emit('quiz:answer_result', {
        correctAnswer: currentQuestion.answer,
        players: updatedQuiz.players,
      });

      setTimeout(() => {
        try {
          const { quiz, nextQuestion: newQuestion, finished } = quizService.nextQuestion(roomId);

          if (finished) {
            logger.info('Quiz finished', {
              roomId,
              finalPlayers: quiz.players,
            });

            this.io.to(roomId).emit('quiz:finished', {
              players: quiz.players
            });
          } else {
            this.io.to(roomId).emit('quiz:question', {
              question: newQuestion,
              questionIndex: quiz.currentQuestionIndex,
              totalQuestions: quiz.questions.length,
            });
          }
        } catch (nextError) {
          const errorMessage = nextError instanceof Error ? nextError.message : 'Error proceeding to next question';

          logger.error('Error proceeding to next question', {
            roomId,
            error: errorMessage,
          });

          this.io.to(roomId).emit('quiz:error', {
            message: errorMessage,
          });
        }
      }, NEXT_QUESTION_DELAY);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error submitting answer';

      socketLogger.error(this.socket.id, error as Error, userId);
      logger.error('Error submitting answer', {
        socketId: this.socket.id,
        userId,
        error: errorMessage,
        data,
      });

      this.socket.emit('quiz:error', {
        message: errorMessage
      });
    }
  }

  private getUserId(): string | undefined {
    return (this.socket as Socket & { user?: SocketUser }).user?.id;
  }
}

export const quizSocketHandler = (io: SocketIOServer, socket: Socket): void => {
  new QuizSocketHandler(io, socket);
};

export default quizSocketHandler;