import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSharedDeck } from '../api/decks';

import '../assets/css/deck.css';
import '../assets/css/shared-deck.css';

const PublicHeader = () => (
    <header className="app-header public-header">
         <div className="header-container">
            <div className="header-logo-section">
                <Link to="/"><i className="fas fa-brain"></i> Recall</Link>
            </div>
            <div className="header-actions">
                <Link to="/register" className="btn btn-primary">Crie sua Conta Grátis</Link>
            </div>
        </div>
    </header>
);

const LoadingState = () => (
    <div className="deck-state-container">
        <div className="loading-spinner"></div>
        <p>Carregando baralho compartilhado...</p>
    </div>
);

const ErrorState = ({ message }) => (
    <div className="deck-state-container">
        <div className="error-icon"><i className="fas fa-exclamation-triangle"></i></div>
        <h2>Não foi possível carregar o baralho</h2>
        <p>{message}</p>
        <Link to="/" className="btn btn-secondary">Voltar à Página Inicial</Link>
    </div>
);

const DeckContentView = ({ deck }) => (
    <>
        <section className="deck-hero-public">
            <h1 id="deck-title-heading">{deck.title}</h1>
            <p id="deck-description-paragraph">{deck.description || "Este baralho não tem uma descrição."}</p>
        </section>
        <section className="flashcards-section-public">
            <div className="section-header">
                 <h2 className="section-title">Flashcards ({deck.flashcards.length})</h2>
            </div>
            <div className="flashcards-grid">
                {deck.flashcards.length > 0 ? (
                    deck.flashcards.map((card, index) => (
                        <div key={index} className="flashcard-item">
                            <h3 className="flashcard-question">{card.question}</h3>
                            <p className="flashcard-answer">{card.answer}</p>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>Este baralho não contém flashcards no momento.</p>
                    </div>
                )}
            </div>
        </section>
        <footer className="shared-deck-footer">
            <h3>Gostou do que viu?</h3>
            <p>Crie sua conta no Recall para salvar este baralho, estudar com nosso método inteligente e criar seus próprios flashcards.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Começar a Estudar Agora</Link>
        </footer>
    </>
);

function SharedDeck() {
    const { shareableId } = useParams();
    const [deck, setDeck] = useState(null);
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadDeck = async () => {
            setStatus('loading');
            try {
                const data = await fetchSharedDeck(shareableId);
                setDeck(data);
                setStatus('success');
            } catch (err) {
                setErrorMessage(err.message || "Não foi possível encontrar este baralho. O link pode estar incorreto ou o acesso foi revogado.");
                setStatus('error');
            }
        };
        loadDeck();
    }, [shareableId]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return <LoadingState />;
            case 'error':
                return <ErrorState message={errorMessage} />;
            case 'success':
                return <DeckContentView deck={deck} />;
            default:
                return null;
        }
    };

    return (
        <>
            <PublicHeader />
            <main className="deck-main public-view">
                {renderContent()}
            </main>
        </>
    );
}

export default SharedDeck;