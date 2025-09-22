import supabase from '@/config/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { QuizRoom, SocketUser, Flashcard } from '@/types';
import { ValidationError } from '@/middleware/errorHandler';
import { logger } from '@/config/logger';

const quizzes: Record<string, QuizRoom> = {};

const getSafeQuestion = (question: Flashcard): Omit<Flashcard, 'answer'> | null => {
  if (!question) return null;
  const { answer, ...safeQuestion } = question;
  return safeQuestion;
};

export const createQuiz = async (deckId: string, hostUser: SocketUser): Promise<{
  quiz: QuizRoom;
  roomId: string;
}> => {
  try {
    const { data: flashcards, error } = await supabase
      .from('flashcards')
      .select('id, question, answer, options, card_type')
      .eq('deck_id', deckId)
      .limit(10);

    if (error) {
      throw new Error('Unable to fetch flashcards for quiz');
    }

    if (!flashcards || flashcards.length < 2) {
      throw new ValidationError('Deck must have at least 2 flashcards to start a quiz');
    }

    const roomId = uuidv4().substring(0, 5).toUpperCase();

    const quizState: QuizRoom = {
      id: roomId,
      deck_id: deckId,
      host_id: hostUser.socketId,
      participants: [{ ...hostUser, score: 0 }],
      current_question: flashcards[0],
      question_number: 0,
      total_questions: flashcards.length,
      status: 'waiting',
      created_at: new Date().toISOString(),
      questions: flashcards,
      currentQuestionIndex: 0,
      players: [{ ...hostUser, score: 0 }],
    };

    quizzes[roomId] = quizState;

    logger.info('Quiz created successfully', {
      roomId,
      deckId,
      hostId: hostUser.id,
      questionCount: flashcards.length,
    });

    return {
      quiz: quizState,
      roomId,
    };

  } catch (error) {
    logger.error('Error creating quiz', {
      deckId,
      hostUserId: hostUser.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

export const joinQuiz = (roomId: string, player: SocketUser): QuizRoom => {
  const quiz = quizzes[roomId];

  if (!quiz) {
    throw new ValidationError('Quiz room not found');
  }

  if (quiz.status !== 'waiting') {
    throw new ValidationError('Quiz has already started');
  }

  const existingPlayer = quiz.players.find(p => p.id === player.id);
  if (existingPlayer) {
    existingPlayer.socketId = player.socketId;
  } else {
    quiz.players.push({ ...player, score: 0 });
  }

  logger.info('Player joined quiz', {
    roomId,
    playerId: player.id,
    playerCount: quiz.players.length,
  });

  return quiz;
};

export const startQuiz = (roomId: string, hostId: string): {
  quiz: QuizRoom;
  currentQuestion: Omit<Flashcard, 'answer'>;
} => {
  const quiz = quizzes[roomId];

  if (!quiz) {
    throw new ValidationError('Quiz room not found');
  }

  if (quiz.host_id !== hostId) {
    throw new ValidationError('Only the host can start the quiz');
  }

  if (quiz.status !== 'waiting') {
    throw new ValidationError('Quiz has already started');
  }

  quiz.status = 'active';
  quiz.currentQuestionIndex = 0;
  quiz.current_question = quiz.questions[0];

  const safeQuestion = getSafeQuestion(quiz.questions[0]);
  if (!safeQuestion) {
    throw new Error('No valid questions available');
  }

  logger.info('Quiz started', {
    roomId,
    hostId,
    playerCount: quiz.players.length,
    questionCount: quiz.questions.length,
  });

  return {
    quiz,
    currentQuestion: safeQuestion,
  };
};

export const submitAnswer = (roomId: string, socketId: string, answer: string): QuizRoom => {
  const quiz = quizzes[roomId];

  if (!quiz) {
    throw new ValidationError('Quiz room not found');
  }

  if (quiz.status !== 'active') {
    throw new ValidationError('Quiz is not active');
  }

  const player = quiz.players.find(p => p.socketId === socketId);
  if (!player) {
    throw new ValidationError('Player not found in quiz');
  }

  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  if (!currentQuestion) {
    throw new Error('Current question not found');
  }
  const isCorrect = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();

  if (isCorrect) {
    player.score = (player.score || 0) + 1;
  }

  logger.debug('Answer submitted', {
    roomId,
    playerId: player.id,
    answer,
    correct: isCorrect,
    score: player.score,
  });

  return quiz;
};

export const nextQuestion = (roomId: string): {
  quiz: QuizRoom;
  nextQuestion?: Omit<Flashcard, 'answer'>;
  finished: boolean;
} => {
  const quiz = quizzes[roomId];

  if (!quiz) {
    throw new ValidationError('Quiz room not found');
  }

  quiz.currentQuestionIndex++;

  if (quiz.currentQuestionIndex >= quiz.questions.length) {
    quiz.status = 'finished';

    logger.info('Quiz finished', {
      roomId,
      finalScores: quiz.players.map(p => ({ id: p.id, score: p.score })),
    });

    return {
      quiz,
      finished: true,
    };
  }

  quiz.current_question = quiz.questions[quiz.currentQuestionIndex];
  const safeQuestion = getSafeQuestion(quiz.questions[quiz.currentQuestionIndex]);

  if (!safeQuestion) {
    throw new Error('No valid next question available');
  }

  return {
    quiz,
    nextQuestion: safeQuestion,
    finished: false,
  };
};

export const getQuiz = (roomId: string): QuizRoom | null => {
  return quizzes[roomId] || null;
};

export const deleteQuiz = (roomId: string): boolean => {
  const existed = roomId in quizzes;
  delete quizzes[roomId];

  if (existed) {
    logger.info('Quiz deleted', { roomId });
  }

  return existed;
};

export default {
  createQuiz,
  joinQuiz,
  startQuiz,
  submitAnswer,
  nextQuestion,
  getQuiz,
  deleteQuiz,
};