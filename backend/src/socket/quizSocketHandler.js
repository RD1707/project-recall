const quizService = require('../services/quizService');
const logger = require('../config/logger');

const NEXT_QUESTION_DELAY = 4000; 

module.exports = function(io, socket) {

     const handleCreateQuiz = async (data, callback) => {
        try {
            const hostId = socket.id;
            
            const { quiz, roomId } = await quizService.createQuiz(data.deckId, hostId);
            
            socket.join(roomId);
            logger.info(`Utilizador ${socket.id} criou e juntou-se à sala ${roomId}`);

            callback({ success: true, quiz, roomId });

        } catch (error) {
            logger.error(`Erro ao criar quiz para o socket ${socket.id}: ${error.message}`);
            callback({ success: false, message: error.message });
        }
    };

    const handleJoinQuiz = (data, callback) => {
        try {
            const { roomId, user } = data;
            if (!user || !user.id || !user.username) {
                throw new Error("Informações de utilizador inválidas.");
            }
            
            const playerWithSocketId = { ...user, socketId: socket.id };
            const updatedQuiz = quizService.joinQuiz(roomId, playerWithSocketId);
            
            socket.join(roomId);

            logger.info(`Utilizador ${user.username} (${socket.id}) juntou-se à sala ${roomId}`);

            io.to(roomId).emit('quiz:updated', updatedQuiz);
            
            callback({ success: true, quiz: updatedQuiz });

        } catch (error) {
            logger.error(`Erro ao juntar à sala para o socket ${socket.id}: ${error.message}`);
            callback({ success: false, message: error.message });
        }
    };

    const handleStartQuiz = (data) => {
        try {
            const { roomId } = data;
            const hostId = socket.id;

            const { quiz, currentQuestion } = quizService.startQuiz(roomId, hostId);
            
            io.to(roomId).emit('quiz:started', { quiz });

            io.to(roomId).emit('quiz:question', {
                question: currentQuestion,
                questionIndex: quiz.currentQuestionIndex,
                totalQuestions: quiz.questions.length
            });

        } catch (error) {
            logger.error(`Erro ao iniciar o quiz pelo socket ${socket.id}: ${error.message}`);
            socket.emit('quiz:error', { message: error.message });
        }
    };
    const handleSubmitAnswer = (data) => {
        try {
            const { roomId, answer } = data;
            
            const updatedQuiz = quizService.submitAnswer(roomId, socket.id, answer);
            
            const currentQuestion = updatedQuiz.questions[updatedQuiz.currentQuestionIndex];

            io.to(roomId).emit('quiz:answer_result', {
                correctAnswer: currentQuestion.answer,
                players: updatedQuiz.players
            });

            setTimeout(() => {
                const { quiz, nextQuestion: newQuestion, finished } = quizService.nextQuestion(roomId);

                if (finished) {
                    io.to(roomId).emit('quiz:finished', { players: quiz.players });
                } else {
                    io.to(roomId).emit('quiz:question', {
                        question: newQuestion,
                        questionIndex: quiz.currentQuestionIndex,
                        totalQuestions: quiz.questions.length
                    });
                }
            }, NEXT_QUESTION_DELAY);

        } catch (error) {
            logger.error(`Erro ao submeter resposta pelo socket ${socket.id}: ${error.message}`);
            socket.emit('quiz:error', { message: error.message });
        }
    };

    socket.on('quiz:create', handleCreateQuiz);
    socket.on('quiz:join', handleJoinQuiz);
    socket.on('quiz:start', handleStartQuiz);
    socket.on('quiz:submit_answer', handleSubmitAnswer);
};