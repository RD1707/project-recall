import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchReviewCards, submitReview } from '../api/flashcards';

import '../assets/css/study.css'; 

const ProgressBar = ({ current, total }) => {
  const progress = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="global-progress">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="progress-text">{current} / {total}</span>
    </div>
  );
};

const FlipCard = ({ card, isFlipped, onFlip }) => (
  <div className={`flip-card ${isFlipped ? 'is-flipped' : ''}`} onClick={onFlip}>
    <div className="flip-card-inner">
      <div className="card-face card-front">
        <p className="card-content">{card?.question}</p>
      </div>
      <div className="card-face card-back">
        <p className="card-content">{card?.answer}</p>
      </div>
    </div>
  </div>
);

function StudySession() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  useEffect(() => {
    const loadReviewCards = async () => {
      setIsLoading(true);
      try {
        const reviewCards = await fetchReviewCards(deckId);
        if (reviewCards.length === 0) {
          toast.success("Tudo em dia! Não há cards para revisar agora.");
          navigate(`/deck/${deckId}`);
          return;
        }
        setCards(reviewCards);
      } catch (error) {
        toast.error("Não foi possível carregar os cards para revisão.");
        navigate(`/deck/${deckId}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadReviewCards();
  }, [deckId, navigate]);

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleNextCard = useCallback((quality) => {
    if (!isFlipped) return;

    submitReview(currentCard.id, quality).catch(err => {
        console.error("Falha ao salvar revisão:", err);
    });

    if (quality >= 3) { 
        setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else { 
        setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, cards.length, currentCard, isFlipped]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isComplete) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      }
      if (isFlipped) {
        if (e.key === '1') handleNextCard(1);
        if (e.key === '2') handleNextCard(2);
        if (e.key === '3') handleNextCard(3);
        if (e.key === '4') handleNextCard(4);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleNextCard, isComplete]);

  if (isLoading) {
    return <div className="loading-state">A preparar a sua sessão de estudo...</div>;
  }

  if (isComplete) {
    return (
      <div className="completion-container">
        <h1>Sessão Concluída!</h1>
        <p>Bom trabalho!</p>
        <div className="session-stats">
          <p>Acertos: {sessionStats.correct}</p>
          <p>Erros: {sessionStats.wrong}</p>
        </div>
        <div className="completion-actions">
          <Link to={`/deck/${deckId}`} className="btn btn-primary">Voltar ao Baralho</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="study-main">
      <header className="study-header">
        <Link to={`/deck/${deckId}`}><i className="fas fa-arrow-left"></i> Voltar</Link>
        <ProgressBar current={currentIndex + 1} total={cards.length} />
      </header>
      
      <div className="card-stage">
        <FlipCard card={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />
      </div>

      <div className="response-controls">
        {!isFlipped ? (
          <button onClick={handleFlip} className="btn btn-primary btn-large flip-btn">
            Revelar Resposta <kbd>Espaço</kbd>
          </button>
        ) : (
          <div className="quality-buttons">
            <div className="quality-grid">
              <button onClick={() => handleNextCard(1)} className="quality-btn" data-feedback="again">Errei <kbd>1</kbd></button>
              <button onClick={() => handleNextCard(2)} className="quality-btn" data-feedback="hard">Difícil <kbd>2</kbd></button>
              <button onClick={() => handleNextCard(3)} className="quality-btn" data-feedback="good">Bom <kbd>3</kbd></button>
              <button onClick={() => handleNextCard(4)} className="quality-btn" data-feedback="easy">Fácil <kbd>4</kbd></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudySession;