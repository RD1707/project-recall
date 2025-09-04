import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchReviewCards, submitReview } from '../api/flashcards';
import { fetchDeckById } from '../api/decks';

import '../assets/css/study.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// NOVO: Componente de Tela de Conclusão (movido para dentro do mesmo arquivo para simplicidade)
const CompletionScreen = ({ stats, deckId, onRestart, onReviewMistakes }) => {
    const chartData = {
        labels: ['Fácil', 'Bom', 'Difícil', 'Errei'],
        datasets: [{
            label: 'Respostas',
            data: [stats.easy, stats.good, stats.hard, stats.wrong],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
            borderRadius: 4,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    return (
        <div className="state-container completion-state">
            <div className="completion-content">
                <div className="celebration-animation">
                    <div className="trophy-icon"><i className="fas fa-trophy"></i></div>
                </div>
                <div className="completion-header">
                    <h1>Sessão Concluída!</h1>
                    <p>Você está no caminho certo para dominar este conteúdo.</p>
                </div>
                <div className="session-stats">
                    <div className="stats-grid">
                         <div className="stat-block"><div className="stat-icon success"><i className="fas fa-clock"></i></div><div className="stat-details"><span className="stat-number">{Math.floor(stats.totalTime / 60)}m {stats.totalTime % 60}s</span><span className="stat-description">Tempo total</span></div></div>
                        <div className="stat-block"><div className="stat-icon primary"><i className="fas fa-layer-group"></i></div><div className="stat-details"><span className="stat-number">{stats.totalCardsStudied}</span><span className="stat-description">Cards revisados</span></div></div>
                    </div>
                    <div className="performance-chart">
                        <h3>Distribuição de Respostas</h3>
                        <div className="chart-container" style={{ height: '250px' }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className="completion-actions">
                    {stats.wrong > 0 && (
                        <button onClick={onReviewMistakes} className="btn btn-outline">
                            <i className="fas fa-redo"></i> Revisar Erros ({stats.wrong})
                        </button>
                    )}
                    <button onClick={onRestart} className="btn btn-primary">
                        <i className="fas fa-play"></i> Estudar Novamente
                    </button>
                    <Link to={`/deck/${deckId}`} className="btn btn-secondary">
                        <i className="fas fa-home"></i> Voltar ao Baralho
                    </Link>
                </div>
            </div>
        </div>
    );
};


function StudySession() {
    const { deckId } = useParams();
    const navigate = useNavigate();

    // Estado expandido para mais funcionalidades
    const [deck, setDeck] = useState(null);
    const [allCards, setAllCards] = useState([]); // Guarda todos os cards originais
    const [cardsToStudy, setCardsToStudy] = useState([]); // Cards da sessão atual
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [timer, setTimer] = useState(0);
    const [studyMode, setStudyMode] = useState('normal'); // 'normal', 'speed', 'hard'
    const [feedback, setFeedback] = useState({ show: false, type: '', text: '' }); // Para feedback visual

    // Stats mais detalhados
    const [sessionStats, setSessionStats] = useState({
        correct: 0, wrong: 0, hard: 0, easy: 0, good: 0,
        streak: 0, maxStreak: 0,
        totalTime: 0, totalCardsStudied: 0,
        mistakes: new Set(),
    });
    
    const timerRef = useRef(null);

    // Carregamento inicial dos dados
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [reviewCards, deckData] = await Promise.all([
                    fetchReviewCards(deckId),
                    fetchDeckById(deckId)
                ]);

                if (reviewCards.length === 0) {
                    toast.success("Tudo em dia! Não há cards para revisar agora.");
                    navigate(`/deck/${deckId}`);
                    return;
                }
                setAllCards(reviewCards);
                setCardsToStudy(reviewCards);
                setDeck(deckData);
            } catch (error) {
                toast.error("Não foi possível carregar a sessão de estudo.");
                navigate(`/deck/${deckId}`);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [deckId, navigate]);

    // Lógica do timer
    useEffect(() => {
        if (!isLoading && !isComplete) {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isLoading, isComplete]);

    const currentCard = useMemo(() => cardsToStudy[currentIndex], [cardsToStudy, currentIndex]);

    const resetSession = (cards = allCards) => {
        setCardsToStudy(cards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsComplete(false);
        setTimer(0);
        setSessionStats({
            correct: 0, wrong: 0, hard: 0, easy: 0, good: 0,
            streak: 0, maxStreak: 0, totalTime: 0, totalCardsStudied: 0,
            mistakes: new Set(),
        });
    };
    
    const handleFlip = useCallback(() => {
        if (!isFlipped) {
            setIsFlipped(true);
        }
    }, [isFlipped]);

    const showFeedback = (quality) => {
        const feedbackMap = {
            1: { type: 'error', text: 'Vamos revisar em breve' },
            2: { type: 'warning', text: 'Quase lá!' },
            3: { type: 'success', text: 'Muito bem!' },
            4: { type: 'perfect', text: 'Excelente!' }
        };
        setFeedback({ show: true, ...feedbackMap[quality] });
        setTimeout(() => setFeedback({ show: false, type: '', text: '' }), 600);
    };

    const handleNextCard = useCallback(() => {
        if (currentIndex < cardsToStudy.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            setSessionStats(prev => ({ ...prev, totalTime: timer, totalCardsStudied: cardsToStudy.length }));
            setIsComplete(true);
        }
    }, [currentIndex, cardsToStudy.length, timer]);

    const handleQualitySelection = useCallback((quality) => {
        if (!isFlipped) return;

        showFeedback(quality);

        submitReview(currentCard.id, quality).catch(err => {
            console.error("Falha ao salvar revisão:", err);
            toast.error("Não foi possível salvar sua resposta.");
        });

        setSessionStats(prev => {
            const newStats = { ...prev };
            let newStreak = prev.streak;
            let newMistakes = new Set(prev.mistakes);

            if (quality === 1) { newStats.wrong++; newStreak = 0; newMistakes.add(currentCard.id); }
            if (quality === 2) { newStats.hard++; newStreak++; }
            if (quality === 3) { newStats.good++; newStreak++; }
            if (quality === 4) { newStats.easy++; newStreak++; }
            
            newStats.streak = newStreak;
            newStats.maxStreak = Math.max(prev.maxStreak, newStreak);
            newStats.mistakes = newMistakes;

            return newStats;
        });

        setTimeout(handleNextCard, 300);

    }, [isFlipped, currentCard, handleNextCard]);
    
    const handleReviewMistakes = () => {
        const mistakeIds = Array.from(sessionStats.mistakes);
        const mistakeCards = allCards.filter(card => mistakeIds.includes(card.id));
        resetSession(mistakeCards);
    };
    
    // Atalhos do teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isComplete) return;

            if (e.code === 'Space' || e.key === 'Enter') {
                e.preventDefault();
                handleFlip();
            }
            if (isFlipped) {
                if (e.key >= '1' && e.key <= '4') {
                    e.preventDefault();
                    handleQualitySelection(parseInt(e.key));
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, handleQualitySelection, isComplete, handleFlip]);

    if (isLoading) {
        return (
            <div className="state-container loading-state">
                <div className="loading-animation"><div className="loading-spinner"></div></div>
                <h2>Preparando sua sessão</h2>
                <p>Carregando flashcards...</p>
            </div>
        );
    }

    if (isComplete) {
        return <CompletionScreen 
            stats={sessionStats} 
            deckId={deckId} 
            onRestart={() => resetSession()}
            onReviewMistakes={handleReviewMistakes}
        />;
    }

    return (
        <>
            <header className="study-header">
                <div className="header-container">
                    <div className="header-left">
                        <Link to={`/deck/${deckId}`} className="icon-btn ghost" aria-label="Voltar ao baralho"><i className="fas fa-arrow-left"></i></Link>
                        <div className="deck-info">
                            <h1 className="deck-title">{deck?.title ?? 'Carregando...'}</h1>
                        </div>
                    </div>
                    <div className="header-center">
                        <div className="study-timer"><i className="fas fa-clock"></i><time>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</time></div>
                    </div>
                    <div className="header-right">
                         <div className="study-mode-toggle">
                            <button className={`mode-btn ${studyMode === 'normal' ? 'active' : ''}`} onClick={() => setStudyMode('normal')}>
                                <i className="fas fa-graduation-cap"></i> Normal
                            </button>
                             <button className={`mode-btn ${studyMode === 'speed' ? 'active' : ''}`} onClick={() => setStudyMode('speed')}>
                                <i className="fas fa-bolt"></i> Rápido
                            </button>
                        </div>
                    </div>
                </div>
                <div className="global-progress">
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${((currentIndex + 1) / cardsToStudy.length) * 100}%` }}></div></div>
                    <div className="progress-info">
                        <span className="progress-text">{currentIndex + 1} / {cardsToStudy.length}</span>
                        <div className="progress-stats">
                            <span className="stat success"><i className="fas fa-check-circle"></i>{sessionStats.good + sessionStats.easy}</span>
                            <span className="stat warning"><i className="fas fa-exclamation-circle"></i>{sessionStats.hard}</span>
                            <span className="stat danger"><i className="fas fa-times-circle"></i>{sessionStats.wrong}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="study-main">
                <div className="study-container">
                    <div className="card-stage">
                        <div className="main-card-container">
                            <div className={`flip-card ${isFlipped ? 'is-flipped' : ''}`} onClick={handleFlip}>
                                <div className="flip-card-inner">
                                    <article className="card-face card-front">
                                        <div className="card-body"><div className="card-content-wrapper"><p className="card-content">{currentCard?.question}</p></div></div>
                                        <div className="card-footer"><div className="card-prompt"><kbd>Espaço</kbd> para revelar</div></div>
                                    </article>
                                    <article className="card-face card-back">
                                        <div className="card-body"><div className="card-content-wrapper"><p className="card-content">{currentCard?.answer}</p></div></div>
                                        <div className="card-footer"><p className="quality-prompt">Como foi seu desempenho?</p></div>
                                    </article>
                                </div>
                                <div className={`feedback-overlay ${feedback.type} ${feedback.show ? 'active' : ''}`}>
                                    <div className="feedback-content">
                                        <div className="feedback-text">{feedback.text}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="response-controls">
                        {!isFlipped ? (
                            <button onClick={handleFlip} className="btn btn-primary btn-large flip-btn">
                                <i className="fas fa-sync-alt"></i><span>Revelar Resposta</span><kbd>Espaço</kbd>
                            </button>
                        ) : (
                            <div className="quality-buttons">
                                <div className="quality-grid">
                                    <button onClick={() => handleQualitySelection(1)} className="quality-btn" data-feedback="again"><div className="quality-icon"><i className="fas fa-redo"></i></div><div className="quality-info"><span className="quality-label">Errei</span><span className="quality-time">&lt; 1 min</span></div><kbd>1</kbd></button>
                                    <button onClick={() => handleQualitySelection(2)} className="quality-btn" data-feedback="hard"><div className="quality-icon"><i className="fas fa-brain"></i></div><div className="quality-info"><span className="quality-label">Difícil</span><span className="quality-time">~6 min</span></div><kbd>2</kbd></button>
                                    <button onClick={() => handleQualitySelection(3)} className="quality-btn" data-feedback="good"><div className="quality-icon"><i className="fas fa-check"></i></div><div className="quality-info"><span className="quality-label">Bom</span><span className="quality-time">~10 min</span></div><kbd>3</kbd></button>
                                    <button onClick={() => handleQualitySelection(4)} className="quality-btn" data-feedback="easy"><div className="quality-icon"><i className="fas fa-star"></i></div><div className="quality-info"><span className="quality-label">Fácil</span><span className="quality-time">~4 dias</span></div><kbd>4</kbd></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

export default StudySession;