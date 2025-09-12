import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Header from '../components/common/Header';
import '../assets/css/quiz.css';

const QuizCompletionScreen = ({ players, currentUser, roomId }) => {
    const winner = players[0];
    const isWinner = winner.id === currentUser?.id;

    return (
        <div className="completion-container">
            <div className="completion-header">
                {isWinner ? (
                    <>
                        <div className="trophy-icon"><i className="fas fa-trophy"></i></div>
                        <h1>Parabéns, você venceu!</h1>
                        <p>Excelente desempenho! Você ficou em primeiro lugar.</p>
                    </>
                ) : (
                    <>
                        <div className="trophy-icon"><i className="fas fa-award"></i></div>
                        <h1>Quiz Finalizado!</h1>
                        <p>Ótimo jogo! O vencedor foi <strong>{winner.username}</strong>.</p>
                    </>
                )}
            </div>

            <div className="final-leaderboard">
                <h3>Resultados Finais</h3>
                {players.map((player, index) => (
                    <div key={player.id} className="ranking-row">
                        <div className="rank-cell">
                            <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                        </div>
                        <div className="user-cell">
                            <div className="user-avatar">
                                {player.avatar_url ? <img src={player.avatar_url} alt={player.username} /> : <span>{player.username.charAt(0).toUpperCase()}</span>}
                            </div>
                            <span className="username">{player.username}</span>
                        </div>
                        <div className="points-cell">
                            <span className="points-value">{player.score.toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="completion-actions">
                <Link to={`/quiz/${roomId}`} className="btn btn-primary">Jogar Novamente</Link>
                <Link to="/dashboard" className="btn btn-secondary">Voltar ao Início</Link>
            </div>
        </div>
    );
};


function QuizGame() {
    const { roomId } = useParams();
    const socket = useSocket();
    const navigate = useNavigate();

    const [gameState, setGameState] = useState('playing'); 
    const [question, setQuestion] = useState(null);
    const [quizInfo, setQuizInfo] = useState({ questionIndex: 0, totalQuestions: 0 });
    const [players, setPlayers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerResult, setAnswerResult] = useState(null);

    useEffect(() => {
        const getUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setCurrentUser({ ...user, ...profile });
            }
        };
        getUserProfile();
    }, []);

    useEffect(() => {
        if (!socket) {
            navigate(`/quiz/${roomId}`);
            return;
        }

        const handleQuestion = (data) => {
            setQuestion(data.question);
            setQuizInfo({
                questionIndex: data.questionIndex,
                totalQuestions: data.totalQuestions,
            });
            setSelectedAnswer(null);
            setAnswerResult(null);
        };

        const handleAnswerResult = (data) => {
            setAnswerResult(data.correctAnswer);
            setPlayers(data.players);
        };

        const handleQuizFinished = (data) => {
            setPlayers(data.players);
            setGameState('finished');
        };

        socket.on('quiz:question', handleQuestion);
        socket.on('quiz:answer_result', handleAnswerResult);
        socket.on('quiz:finished', handleQuizFinished);

        return () => {
            socket.off('quiz:question', handleQuestion);
            socket.off('quiz:answer_result', handleAnswerResult);
            socket.off('quiz:finished', handleQuizFinished);
        };
    }, [socket, roomId, navigate]);

    const handleAnswerSubmit = (answer) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);
        socket.emit('quiz:submit_answer', { roomId, answer });
    };

    if (gameState === 'finished') {
        return (
            <>
                <Header />
                <main className="quiz-lobby-main">
                    <QuizCompletionScreen players={players} currentUser={currentUser} roomId={roomId} />
                </main>
            </>
        );
    }

    if (!question) {
        return (
             <>
                <Header />
                <main className="quiz-lobby-main">
                    <div className="loading-state">
                        <h2>A aguardar a próxima pergunta...</h2>
                    </div>
                </main>
            </>
        );
    }
    
    const getButtonClass = (option) => {
        let baseClass = 'btn btn-outline option-btn';
        if (!answerResult) {
            return selectedAnswer === option ? `${baseClass} selected` : baseClass;
        } else {
            if (option === answerResult) return `${baseClass} correct`;
            if (option === selectedAnswer && option !== answerResult) return `${baseClass} incorrect`;
            return `${baseClass} disabled`;
        }
    };

    return (
        <>
            <Header />
            <main className="quiz-game-main">
                <div className="game-container">
                    <div className="game-header">
                        <p>Pergunta {quizInfo.questionIndex + 1} de {quizInfo.totalQuestions}</p>
                    </div>
                    <div className="question-container">
                        <h2>{question.question}</h2>
                    </div>
                    <div className="answers-container">
                        {question.options.map((option, index) => (
                            <button 
                                key={index} 
                                className={getButtonClass(option)}
                                onClick={() => handleAnswerSubmit(option)}
                                disabled={!!selectedAnswer}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}

export default QuizGame;