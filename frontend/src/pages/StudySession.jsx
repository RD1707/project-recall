import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchReviewCards, submitReview } from '../api/flashcards';
import { fetchDeckById } from '../api/decks';

import '../assets/css/study.css'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CompletionScreen = ({ stats, deckId }) => {
  const chartData = {
    labels: ['Fácil', 'Bom', 'Difícil', 'Errei'],
    datasets: [{
      label: 'Respostas',
      data: [stats.easy, stats.good, stats.hard, stats.wrong],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      borderRadius: 4,
    }],
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
                    <div className="stat-block"><div className="stat-icon primary"><i className="fas fa-layer-group"></i></div><div className="stat-details"><span className="stat-number">{stats.totalCards}</span><span className="stat-description">Cards revisados</span></div></div>
                </div>
                <div className="performance-chart">
                    <h3>Distribuição de Respostas</h3>
                    <div className="chart-container" style={{ height: '250px' }}>
                        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            </div>
            <div className="completion-actions">
                <Link to={`/deck/${deckId}`} className="btn btn-secondary"><i className="fas fa-home"></i>Voltar ao Baralho</Link>
                <Link to={`/study/${deckId}`} className="btn btn-primary" onClick={() => window.location.reload()}><i className="fas fa-redo"></i>Estudar Novamente</Link>
            </div>
        </div>
    </div>
  );
};


function StudySession() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(0);

  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    wrong: 0,
    hard: 0,
    easy: 0,
    good: 0,
    totalTime: 0,
    totalCards: 0
  });

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
        setCards(reviewCards);
        setDeck(deckData);
        setSessionStats(prev => ({...prev, totalCards: reviewCards.length}));
      } catch (error) {
        toast.error("Não foi possível carregar a sessão de estudo.");
        navigate(`/deck/${deckId}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [deckId, navigate]);
  
  useEffect(() => {
      if (!isLoading && !isComplete) {
          const interval = setInterval(() => {
              setTimer(prev => prev + 1);
          }, 1000);
          return () => clearInterval(interval);
      }
  }, [isLoading, isComplete]);

  const currentCard = useMemo(() => cards[currentIndex], [cards, currentIndex]);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleQualitySelection = useCallback((quality) => {
    if (!isFlipped) return;

    submitReview(currentCard.id, quality).catch(err => {
        console.error("Falha ao salvar revisão:", err);
        toast.error("Não foi possível salvar sua resposta.");
    });

    setSessionStats(prev => {
        const newStats = {...prev};
        if(quality === 1) newStats.wrong++;
        if(quality === 2) newStats.hard++;
        if(quality === 3) newStats.good++;
        if(quality === 4) newStats.easy++;
        if(quality >= 3) newStats.correct++;
        return newStats;
    });

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setSessionStats(prev => ({...prev, totalTime: timer}));
      setIsComplete(true);
    }
  }, [currentIndex, cards.length, currentCard, isFlipped, timer]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isComplete) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
      if (isFlipped) {
        if (e.key === '1') handleQualitySelection(1);
        if (e.key === '2') handleQualitySelection(2);
        if (e.key === '3') handleQualitySelection(3);
        if (e.key === '4') handleQualitySelection(4);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleQualitySelection, isComplete]);

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
    return <CompletionScreen stats={sessionStats} deckId={deckId} />;
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
            <div className="header-right"></div>
        </div>
        <div className="global-progress">
            <div className="progress-track"><div className="progress-fill" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}></div></div>
            <div className="progress-info">
                <span className="progress-text">{currentIndex + 1} / {cards.length}</span>
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
                        <button onClick={() => handleQualitySelection(1)} className="quality-btn" data-feedback="again"><div className="quality-icon"><i className="fas fa-redo"></i></div><div className="quality-info"><span className="quality-label">Errei</span></div><kbd>1</kbd></button>
                        <button onClick={() => handleQualitySelection(2)} className="quality-btn" data-feedback="hard"><div className="quality-icon"><i className="fas fa-brain"></i></div><div className="quality-info"><span className="quality-label">Difícil</span></div><kbd>2</kbd></button>
                        <button onClick={() => handleQualitySelection(3)} className="quality-btn" data-feedback="good"><div className="quality-icon"><i className="fas fa-check"></i></div><div className="quality-info"><span className="quality-label">Bom</span></div><kbd>3</kbd></button>
                        <button onClick={() => handleQualitySelection(4)} className="quality-btn" data-feedback="easy"><div className="quality-icon"><i className="fas fa-star"></i></div><div className="quality-info"><span className="quality-label">Fácil</span></div><kbd>4</kbd></button>
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