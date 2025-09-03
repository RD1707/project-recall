import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSharedDeck } from '../api/decks';

import '../assets/css/deck.css';
import '../assets/css/shared-deck.css';

function SharedDeck() {
    const { shareableId } = useParams();
    const [deck, setDeck] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDeck = async () => {
            try {
                setLoading(true);
                const data = await fetchSharedDeck(shareableId);
                setDeck(data);
            } catch (err) {
                setError(err.message || "Não foi possível carregar este baralho.");
            } finally {
                setLoading(false);
            }
        };
        loadDeck();
    }, [shareableId]);

    const renderContent = () => {
        if (loading) {
            return <p>A carregar baralho...</p>;
        }
        if (error) {
            return <p style={{ color: 'red' }}>{error}</p>;
        }
        if (!deck) {
            return <p>Baralho não encontrado.</p>;
        }
        return (
            <>
                <section className="deck-header">
                    <div className="deck-header-content">
                        <h1 id="deck-title-heading">{deck.title}</h1>
                        <p id="deck-description-paragraph">{deck.description || "Sem descrição."}</p>
                    </div>
                </section>
                <section className="deck-content">
                    <div className="flashcards-section">
                        <div className="section-header">
                             <h2 className="section-title">Flashcards ({deck.flashcards.length})</h2>
                        </div>
                        <div className="flashcards-grid">
                            {deck.flashcards.length > 0 ? (
                                deck.flashcards.map((card, index) => (
                                    <div key={index} className="flashcard-item">
                                        <div className="flashcard-content">
                                            <h3 className="flashcard-question">{card.question}</h3>
                                            <p className="flashcard-answer">{card.answer}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>Este baralho não contém flashcards.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </>
        );
    };

    return (
        <>
            <header className="app-header">
                 <div className="header-container">
                    <div className="header-logo-section">
                        <Link to="/">Recall</Link>
                    </div>
                    <div className="header-actions">
                        <Link to="/register" className="btn btn-primary">Criar Conta Grátis</Link>
                    </div>
                </div>
            </header>
            <main className="deck-main">
                {renderContent()}
            </main>
        </>
    );
}

export default SharedDeck;