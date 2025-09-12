import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { useSocket } from '../context/SocketContext';
import { fetchProfile } from '../api/profile'; 
import toast from 'react-hot-toast';
import '../assets/css/quiz.css';

function QuizLobby() {
    const { roomId } = useParams();
    const socket = useSocket();
    const navigate = useNavigate();

    const [quizState, setQuizState] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserProfile = async () => {
            try {
                const profile = await fetchProfile();
                if (!profile) throw new Error("Perfil não encontrado");
                setCurrentUser({
                    id: profile.id, 
                    username: profile.username,
                    avatar_url: profile.avatar_url,
                });
            } catch (error) {
                toast.error("Não foi possível obter os seus dados de utilizador.");
                navigate('/dashboard');
            }
        };
        getUserProfile();
    }, [navigate]);

    useEffect(() => {
        if (socket && currentUser) {
            console.log(`[QuizLobby] A tentar juntar-se à sala ${roomId} como ${currentUser.username}`);
            
            socket.emit('quiz:join', { roomId, user: currentUser }, (response) => {
                setLoading(false);
                if (response.success) {
                    setQuizState(response.quiz);
                } else {
                    toast.error(response.message || "Não foi possível entrar na sala.");
                    navigate('/dashboard');
                }
            });

            const handleQuizUpdate = (updatedQuiz) => {
                console.log('[Socket.IO] Recebido quiz:updated', updatedQuiz);
                setQuizState(updatedQuiz);
            };

            const handleQuizStart = () => {
                toast.success("O quiz vai começar!");
                navigate(`/quiz/game/${roomId}`);
            };

            socket.on('quiz:updated', handleQuizUpdate);
            socket.on('quiz:started', handleQuizStart);

            return () => {
                socket.off('quiz:updated', handleQuizUpdate);
                socket.off('quiz:started', handleQuizStart);
            };
        }
    }, [socket, currentUser, roomId, navigate]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
    };

    const handleStartQuiz = () => {
        socket.emit('quiz:start', { roomId });
    };

    
    if (loading || !quizState) {
        return (
            <>
                <Header />
                <main className="quiz-lobby-main">
                    <div className="loading-state">
                        <h2>A entrar na sala de quiz...</h2>
                    </div>
                </main>
            </>
        );
    }
    
    const { players, hostId } = quizState;
    const isHost = currentUser?.socketId === hostId;

    return (
        <>
            <Header />
            <main className="quiz-lobby-main">
                <div className="lobby-container">
                    <div className="lobby-header">
                        <h2>Lobby do Quiz</h2>
                        <p>A aguardar que outros jogadores se juntem. Partilhe o código ou o link!</p>
                    </div>

                    <div className="room-code-section">
                        <span>Código da Sala</span>
                        <div className="room-code-box">
                            <strong>{roomId}</strong>
                            <button onClick={handleCopyLink} title="Copiar Link"><i className="fas fa-copy"></i></button>
                        </div>
                    </div>

                    <div className="players-section">
                        <h3>Jogadores ({players.length}/10)</h3>
                        <div className="players-grid">
                            {players.map(player => (
                                <div key={player.id} className="player-card">
                                    <div className="player-avatar">
                                        {player.avatar_url ? 
                                            <img src={player.avatar_url} alt={player.username} /> :
                                            <span>{player.username.charAt(0).toUpperCase()}</span>
                                        }
                                    </div>
                                    <span className="player-name">{player.username} {player.id === hostId ? '(Anfitrião)' : ''}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lobby-actions">
                        {isHost ? (
                            <button className="btn btn-primary btn-large" disabled={players.length < 2}>
                                <i className="fas fa-play"></i> Iniciar Quiz ({players.length}/2)
                            </button>
                        ) : (
                            <p className="waiting-text">A aguardar que o anfitrião inicie o quiz...</p>
                        )}
                        <Link to="/dashboard" className="btn btn-secondary">Sair</Link>
                    </div>
                </div>
            </main>
        </>
    );
}

export default QuizLobby;