import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchReviewCards, submitReview } from '../api/flashcards';
import { fetchDeckById } from '../api/decks';

import '../assets/css/study.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LoadingScreen = () => (
    <div className="state-container loading-state">
        <div className="loading-animation">
            <div className="loading-spinner"></div>
        </div>
        <h2>Preparando sua sessão</h2>
        <p>Carregando os flashcards para sua revisão...</p>
    </div>
);

const CompletionScreen = ({ stats, deckId, onRestart, onReviewMistakes }) => {
    const chartData = {
        labels: ['Fácil', 'Bom', 'Difícil', 'Errei'],
        datasets: [{
            label: 'Respostas da Sessão',
            data: [stats.easy, stats.good, stats.hard, stats.wrong],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
            borderRadius: 6,
            borderWidth: 0,
        }],
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    };

    return (
        <div className="state-container completion-state">
            <div className="completion-content">
                <div className="trophy-icon"><i className="fas fa-trophy"></i></div>
                <header className="completion-header">
                    <h1>Sessão Concluída!</h1>
                    <p>Excelente trabalho! Você está um passo mais perto de dominar este assunto.</p>
                </header>

                <div className="session-stats">
                    <div className="stats-grid">
                        <div className="stat-block">
                            <div className="stat-icon primary"><i className="fas fa-layer-group"></i></div>
                            <div className="stat-details"><span className="stat-number">{stats.totalCardsStudied}</span><span className="stat-description">Cards revisados</span></div>
                        </div>
                        <div className="stat-block">
                            <div className="stat-icon success"><i className="fas fa-clock"></i></div>
                            <div className="stat-details"><span className="stat-number">{`${Math.floor(stats.totalTime / 60)}m ${stats.totalTime % 60}s`}</span><span className="stat-description">Tempo total</span></div>
                        </div>
                    </div>
                    <div className="performance-chart">
                        <h3>Desempenho da Sessão</h3>
                        <div className="chart-container">
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

const StudyHeader = ({ deckTitle, timer, currentIndex, totalCards, sessionStats }) => {
    const { deckId } = useParams();
    const progress = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

    return (
        <header className="study-header">
            <div className="header-container">
                <div className="header-left">
                    <Link to={`/deck/${deckId}`} className="icon-btn ghost" aria-label="Voltar ao baralho">
                        <i className="fas fa-arrow-left"></i>
                    </Link>
                    <div className="deck-info">
                        <h1 className="deck-title">{deckTitle}</h1>
                    </div>
                </div>
                <div className="header-center">
                    <div className="study-timer">
                        <i className="fas fa-clock"></i>
                        <time>{`${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}</time>
                    </div>
                </div>
                <div className="header-right">
                </div>
            </div>
            <div className="global-progress">
                <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
                <div className="progress-info">
                    <span className="progress-text">{currentIndex + 1} / {totalCards}</span>
                    <div className="progress-stats">
                        <span className="stat success" title="Bom/Fácil"><i className="fas fa-check-circle"></i>{sessionStats.good + sessionStats.easy}</span>
                        <span className="stat warning" title="Difícil"><i className="fas fa-exclamation-circle"></i>{sessionStats.hard}</span>
                        <span className="stat danger" title="Errou"><i className="fas fa-times-circle"></i>{sessionStats.wrong}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

const StudyCard = ({ card, isFlipped, onFlip, feedback }) => (
    <div className="main-card-container">
        <div className={`flip-card ${isFlipped ? 'is-flipped' : ''}`} onClick={onFlip}>
            <div className="flip-card-inner">
                <article className="card-face card-front">
                    <div className="card-body"><div className="card-content-wrapper"><p className="card-content">{card?.question}</p></div></div>
                    <div className="card-footer"><div className="card-prompt">Pressione <kbd>Espaço</kbd> para revelar</div></div>
                </article>
                <article className="card-face card-back">
                    <div className="card-body"><div className="card-content-wrapper"><p className="card-content">{card?.answer}</p></div></div>
                    <div className="card-footer"><p className="quality-prompt">Como foi seu desempenho?</p></div>
                </article>
            </div>
            <div className={`feedback-overlay ${feedback.type} ${feedback.show ? 'active' : ''}`}>
                <div className="feedback-content">{feedback.text}</div>
            </div>
        </div>
    </div>
);

const ResponseControls = ({ isFlipped, onFlip, onQualitySelect }) => {
    if (!isFlipped) {
        return (
            <button onClick={onFlip} className="btn btn-primary btn-large flip-btn">
                <i className="fas fa-sync-alt"></i>
                <span>Revelar Resposta</span>
                <kbd>Espaço</kbd>
            </button>
        );
    }

    return (
        <div className="quality-buttons">
            <div className="quality-grid">
                <button onClick={() => onQualitySelect(1)} className="quality-btn" data-feedback="again"><div className="quality-icon"><i className="fas fa-redo"></i></div><div className="quality-info"><span className="quality-label">Errei</span><span className="quality-time">&lt; 1 min</span></div><kbd>1</kbd></button>
                <button onClick={() => onQualitySelect(2)} className="quality-btn" data-feedback="hard"><div className="quality-icon"><i className="fas fa-brain"></i></div><div className="quality-info"><span className="quality-label">Difícil</span><span className="quality-time">~6 min</span></div><kbd>2</kbd></button>
                <button onClick={() => onQualitySelect(3)} className="quality-btn" data-feedback="good"><div className="quality-icon"><i className="fas fa-check"></i></div><div className="quality-info"><span className="quality-label">Bom</span><span className="quality-time">~10 min</span></div><kbd>3</kbd></button>
                <button onClick={() => onQualitySelect(4)} className="quality-btn" data-feedback="easy"><div className="quality-icon"><i className="fas fa-star"></i></div><div className="quality-info"><span className="quality-label">Fácil</span><span className="quality-time">~4 dias</span></div><kbd>4</kbd></button>
            </div>
        </div>
    );
};

function StudySession() {
    const { deckId } = useParams();
    const navigate = useNavigate();

    const [deck, setDeck] = useState(null);
    const [allCards, setAllCards] = useState([]);
    const [cardsToStudy, setCardsToStudy] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [status, setStatus] = useState('loading');
    const [timer, setTimer] = useState(0);
    const [feedback, setFeedback] = useState({ show: false, type: '', text: '' });
    const [sessionStats, setSessionStats] = useState({
        wrong: 0, hard: 0, good: 0, easy: 0,
        totalTime: 0, totalCardsStudied: 0,
        mistakes: new Set(),
    });

    const timerRef = useRef(null);
    const currentIndexRef = useRef(currentIndex);
    const cardsToStudyRef = useRef(cardsToStudy);
    const timerValueRef = useRef(timer);

    // Keep refs updated with current state
    useEffect(() => {
        currentIndexRef.current = currentIndex;
        cardsToStudyRef.current = cardsToStudy;
        timerValueRef.current = timer;
    }, [currentIndex, cardsToStudy, timer]);

    useEffect(() => {
        const loadData = async () => {
            setStatus('loading');
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
                setStatus('studying');
            } catch (error) {
                toast.error("Não foi possível carregar a sessão de estudo.");
                navigate(`/deck/${deckId}`);
            }
        };
        loadData();
    }, [deckId, navigate]);

    useEffect(() => {
        if (status === 'studying') {
            timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [status]);

    const currentCard = useMemo(() => cardsToStudy[currentIndex], [cardsToStudy, currentIndex]);

    const resetSession = useCallback((cards) => {
        setCardsToStudy(cards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setTimer(0);
        setSessionStats({
            wrong: 0, hard: 0, good: 0, easy: 0,
            totalTime: 0, totalCardsStudied: 0,
            mistakes: new Set(),
        });
        setStatus('studying');
    }, []);

    const handleFlip = useCallback(() => !isFlipped && setIsFlipped(true), [isFlipped]);

    const handleNextCard = useCallback(() => {
        if (currentIndexRef.current < cardsToStudyRef.current.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            setSessionStats(prev => ({
                ...prev,
                totalTime: timerValueRef.current,
                totalCardsStudied: cardsToStudyRef.current.length
            }));
            setStatus('complete');
        }
    }, []);

    const handleQualitySelection = useCallback((quality) => {
        if (!isFlipped) return;

        const feedbackMap = {
            1: { type: 'error', text: 'Vamos revisar em breve' },
            2: { type: 'warning', text: 'Quase lá!' },
            3: { type: 'success', text: 'Muito bem!' },
            4: { type: 'perfect', text: 'Excelente!' }
        };
        setFeedback({ show: true, ...feedbackMap[quality] });
        setTimeout(() => setFeedback({ show: false, type: '', text: '' }), 600);

        setSessionStats(prev => {
            const newMistakes = new Set(prev.mistakes);
            const statsUpdate = { ...prev };
            if (quality === 1) {
                statsUpdate.wrong++;
                newMistakes.add(currentCard.id);
            }
            if (quality === 2) statsUpdate.hard++;
            if (quality === 3) statsUpdate.good++;
            if (quality === 4) statsUpdate.easy++;
            statsUpdate.mistakes = newMistakes;
            return statsUpdate;
        });

        // Submit review and advance to next card
        submitReview(currentCard.id, quality)
            .catch(() => toast.error("Não foi possível salvar sua resposta."))
            .finally(() => {
                setTimeout(handleNextCard, 300);
            });
    }, [isFlipped, currentCard, handleNextCard]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (status !== 'studying') return;
            if (e.code === 'Space') {
                e.preventDefault();
                handleFlip();
            }
            if (isFlipped && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                handleQualitySelection(Number(e.key));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, isFlipped, handleFlip, handleQualitySelection]);

    if (status === 'loading') return <LoadingScreen />;

    if (status === 'complete') {
        return (
            <CompletionScreen
                stats={sessionStats}
                deckId={deckId}
                onRestart={() => resetSession(allCards)}
                onReviewMistakes={() => {
                    const mistakeCards = allCards.filter(card => sessionStats.mistakes.has(card.id));
                    resetSession(mistakeCards);
                }}
            />
        );
    }

    return (
        <>
            <StudyHeader
                deckTitle={deck?.title ?? 'Carregando...'}
                timer={timer}
                currentIndex={currentIndex}
                totalCards={cardsToStudy.length}
                sessionStats={sessionStats}
            />
            <main className="study-main">
                <div className="study-container">
                    <StudyCard
                        card={currentCard}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                        feedback={feedback}
                    />
                    <div className="response-controls">
                        <ResponseControls
                            isFlipped={isFlipped}
                            onFlip={handleFlip}
                            onQualitySelect={handleQualitySelection}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}

export default StudySession;