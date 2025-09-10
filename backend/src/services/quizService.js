const supabase = require('../config/supabaseClient');
const { v4: uuidv4 } = require('uuid');

const quizzes = {};

const getSafeQuestion = (question) => {
    if (!question) return null;
    const { answer, ...safeQuestion } = question;
    return safeQuestion;
};

const createQuiz = async (deckId, hostId) => {
  try {
    const { data: flashcards, error } = await supabase
      .from('flashcards')
      .select('id, question, answer, options, card_type')
      .eq('deck_id', deckId)
      .limit(10);

    if (error) throw new Error('Não foi possível buscar os flashcards para o quiz.');
    if (flashcards.length < 2) {
        throw new Error('O baralho precisa de ter pelo menos 2 flashcards para iniciar um quiz.');
    }

    const roomId = uuidv4().substring(0, 5).toUpperCase();

    const quizState = {
      deckId,
      hostId,
      players: [],
      questions: flashcards.sort(() => Math.random() - 0.5),
      currentQuestionIndex: 0,
      state: 'waiting',
      createdAt: new Date(),
    };

    quizzes[roomId] = quizState;

    console.log(`[Quiz Service] Novo quiz criado. Sala: ${roomId}`);
    return { quiz: quizState, roomId }; 
  } catch (err) {
    console.error(`[Quiz Service] Erro ao criar quiz: ${err.message}`);
    throw err;
  }
};

const joinQuiz = (roomId, user) => {
  const quiz = quizzes[roomId];
  if (!quiz) {
    throw new Error('Sala de quiz não encontrada.');
  }
  if (quiz.players.some(p => p.id === user.id)) {
    const player = quiz.players.find(p => p.id === user.id);
    player.socketId = user.socketId;
    return quiz;
  }

  quiz.players.push({
    ...user,
    score: 0,
  });
  
  console.log(`[Quiz Service] Utilizador ${user.username} juntou-se à sala ${roomId}`);
  return quiz;
};

const startQuiz = (roomId, userId) => {
    const quiz = quizzes[roomId];
    if (!quiz) throw new Error('Sala de quiz não encontrada.');
    if (quiz.hostId !== userId) throw new Error('Apenas o anfitrião pode iniciar o quiz.');
    if (quiz.state !== 'waiting') throw new Error('O quiz já foi iniciado.');

    quiz.state = 'in_progress';
    console.log(`[Quiz Service] Quiz na sala ${roomId} foi iniciado.`);

    return {
        quiz,
        currentQuestion: getSafeQuestion(quiz.questions[quiz.currentQuestionIndex])
    };
};

const submitAnswer = (roomId, socketId, answer) => {
    const quiz = quizzes[roomId];
    if (!quiz) throw new Error('Sala de quiz não encontrada.');

    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    const player = quiz.players.find(p => p.socketId === socketId);

    if (!player) throw new Error('Jogador não encontrado na sala.');

    const isCorrect = currentQuestion.answer === answer;

    if (isCorrect) {
        player.score += 100;
    }

    console.log(`[Quiz Service] Resposta recebida de ${player.username} na sala ${roomId}. Correta: ${isCorrect}`);
    
    return quiz;
};

const nextQuestion = (roomId) => {
    const quiz = quizzes[roomId];
    if (!quiz) throw new Error('Sala de quiz não encontrada.');
    if (quiz.state !== 'in_progress') return { quiz, finished: true };

    if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
        quiz.currentQuestionIndex++;
        console.log(`[Quiz Service] Avançando para a pergunta ${quiz.currentQuestionIndex} na sala ${roomId}`);
        return {
            quiz,
            nextQuestion: getSafeQuestion(quiz.questions[quiz.currentQuestionIndex]),
            finished: false,
        };
    } else {
        quiz.state = 'finished';
        console.log(`[Quiz Service] Quiz finalizado na sala ${roomId}`);
        quiz.players.sort((a, b) => b.score - a.score);
        return { quiz, finished: true };
    }
};

module.exports = {
  createQuiz,
  joinQuiz,
  startQuiz,
  submitAnswer,
  nextQuestion,
  quizzes
};