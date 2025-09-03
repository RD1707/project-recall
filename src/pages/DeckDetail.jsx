import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import AIGenerator from '../components/decks/AIGenerator'; 
import { fetchDeckById, fetchFlashcardsByDeckId } from '../api/decks';

import '../assets/css/deck.css';

function DeckDetail() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const pollingIntervalRef = useRef(null); 

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling(); 

    let attempts = 0;
    const maxAttempts = 15;
    const initialCardCount = flashcards.length;

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const updatedFlashcards = await fetchFlashcardsByDeckId(deckId);
        if (updatedFlashcards.length > initialCardCount) {
          toast.success(`${updatedFlashcards.length - initialCardCount} novos cards adicionados!`);
          setFlashcards(updatedFlashcards); 
          stopPolling();
        } else if (attempts > maxAttempts) {
          toast.error("A geração demorou mais que o esperado. Tente novamente.");
          stopPolling();
        }
      } catch (error) {
        toast.error("Erro ao verificar novos cards.");
        stopPolling();
      }
    }, 5000); 
  };

  useEffect(() => {
    const loadDeckData = async () => {
      setIsLoading(true);
      try {
        const [deckData, flashcardsData] = await Promise.all([
          fetchDeckById(deckId),
          fetchFlashcardsByDeckId(deckId)
        ]);
        setDeck(deckData);
        setFlashcards(flashcardsData);
      } catch (error) {
        toast.error("Baralho não encontrado. A redirecionar...");
        setTimeout(() => navigate('/dashboard'), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    loadDeckData();
    
    return () => stopPolling(); 
  }, [deckId, navigate]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="deck-main">
          <h1>A carregar baralho...</h1>
        </main>
      </>
    );
  }

  if (!deck) {
    return (
      <>
        <Header />
        <main className="deck-main">
          <h1>Baralho não encontrado</h1>
          <Link to="/dashboard">Voltar para o Dashboard</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="deck-main">
        <section className="deck-hero">
            <div className="hero-content">
                <Link to="/dashboard" className="back-btn">
                    Voltar aos Baralhos
                </Link>
                <div className="deck-info">
                    <h1 id="deck-title-heading">{deck.title}</h1>
                    <p className="deck-description">{deck.description || 'Sem descrição'}</p>
                </div>
                <div className="deck-actions">
                    <Link to={`/study/${deck.id}`} id="study-deck-button" className="btn btn-primary btn-large">
                        <span>
                            <strong>Estudar Agora</strong>
                            <small className="btn-subtitle">Começar sessão de estudo</small>
                        </span>
                    </Link>
                </div>
            </div>
        </section>
        
        <div className="deck-content-grid">
          <section className="flashcards-section">
            <div className="section-header">
              <h2 className="section-title">Flashcards ({flashcards.length})</h2>
            </div>
            <div className="flashcards-grid">
              {flashcards.length > 0 ? (
                flashcards.map(card => (
                  <div key={card.id} className="flashcard-item">
                    <h3 className="flashcard-question">{card.question}</h3>
                    <p className="flashcard-answer">{card.answer}</p>
                  </div>
                ))
              ) : (
                <div className="empty-state"><h3>Nenhum flashcard ainda</h3></div>
              )}
            </div>
          </section>

          <AIGenerator deckId={deckId} onGenerationStart={startPolling} />
        </div>
      </main>
    </>
  );
}

export default DeckDetail;