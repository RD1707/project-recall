import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Header from '../components/common/Header';
import Modal from '../components/common/Modal';
import StarRating from '../components/community/StarRating';
import { cloneDeck, rateDeck } from '../api/decks';

import '../assets/css/deck.css';

const LoadingComponent = () => (
    <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Carregando baralho...</h2>
    </div>
);

// Componente do cabeçalho para visualização da comunidade
const CommunityDeckHeader = ({ deck, onStudy, onClone, onRate, averageRating, ratingCount, isCloning }) => (
    <section className="deck-hero">
        <div className="hero-content">
            <Link to="/community" className="back-btn"><i className="fas fa-arrow-left"></i> Voltar à Comunidade</Link>
            <div className="deck-info">
                <h1 id="deck-title-heading">{deck.title}</h1>
                <p className="deck-description">{deck.description || 'Sem descrição para este baralho.'}</p>
                <div className="deck-author-info">
                    <span>Por: </span>
                    <Link to={`/profile/${deck.author?.username || 'unknown'}`} className="author-link">
                        {deck.author?.username || 'Autor Desconhecido'}
                    </Link>
                </div>
            </div>
            <div className="deck-actions">
                <button onClick={onStudy} className="btn btn-primary btn-large">
                    <i className="fas fa-play-circle"></i>
                    <span><strong>Estudar Agora</strong></span>
                </button>
                <button onClick={onClone} className="btn btn-secondary" disabled={isCloning}>
                    {isCloning ? (
                        <><i className="fas fa-spinner fa-spin"></i> A clonar...</>
                    ) : (
                        <><i className="fas fa-clone"></i> Clonar Baralho</>
                    )}
                </button>
                <div className="deck-rating-section">
                    <StarRating
                        rating={averageRating}
                        ratingCount={ratingCount}
                        onRate={onRate}
                        showExactRating={true}
                    />
                </div>
            </div>
        </div>
    </section>
);

const CommunityDeckStats = ({ stats, averageRating, ratingCount }) => (
    <div className="deck-stats-container">
        <div className="stat-card">
            <div className="stat-icon-container"><i className="fas fa-layer-group stat-main-icon"></i></div>
            <div className="stat-content"><span className="stat-number">{stats.total}</span><span className="stat-label">Total de Cards</span></div>
        </div>
        <div className="stat-card">
            <div className="stat-icon-container"><i className="fas fa-star stat-main-icon"></i></div>
            <div className="stat-content">
                <span className="stat-number">{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</span>
                <span className="stat-label">Avaliação Média</span>
            </div>
        </div>
        <div className="stat-card">
            <div className="stat-icon-container"><i className="fas fa-users stat-main-icon"></i></div>
            <div className="stat-content"><span className="stat-number">{ratingCount}</span><span className="stat-label">Avaliações</span></div>
        </div>
    </div>
);

const FlashcardItem = React.memo(({ card }) => {
    const isMultipleChoice = card.card_type === 'Múltipla Escolha' && Array.isArray(card.options);

    return (
        <div className="flashcard-item" tabIndex={0}>
            <div className="flashcard-content">
                <h3 className="flashcard-question">{card.question}</h3>

                {isMultipleChoice ? (
                    <ul className="flashcard-options">
                        {card.options.map((option, index) => (
                            <li
                                key={index}
                                className={`option-item ${option === card.answer ? 'correct' : ''}`}
                            >
                                <i className={`fas ${option === card.answer ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                {option}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="flashcard-answer">{card.answer}</p>
                )}
            </div>
        </div>
    );
});

const FlashcardList = ({ flashcards }) => (
    <section className="flashcards-section">
        <div className="flashcards-grid">
            {flashcards.length > 0 ? (
                flashcards.map(card => (
                    <FlashcardItem key={card.id} card={card} />
                ))
            ) : (
                <div className="empty-state">
                    <i className="fas fa-box-open empty-state-icon"></i>
                    <h3>Nenhum flashcard</h3>
                    <p>Este baralho não possui flashcards ainda.</p>
                </div>
            )}
        </div>
    </section>
);

function CommunityDeckView() {
    const { deckId } = useParams();
    const navigate = useNavigate();

    const [deck, setDeck] = useState(null);
    const [status, setStatus] = useState('loading');
    const [isCloning, setIsCloning] = useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);

    useEffect(() => {
        const loadDeckData = async () => {
            setStatus('loading');
            try {
                const { supabase } = await import('../api/supabaseClient');
                const { data: { session } } = await supabase.auth.getSession();

                const response = await fetch(`/api/community/decks/${deckId}/view`, {
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Baralho não encontrado ou não é público');
                }

                const deckData = await response.json();
                setDeck(deckData);
                setAverageRating(deckData.average_rating || 0);
                setRatingCount(deckData.rating_count || 0);
                setStatus('success');
            } catch (error) {
                console.error('Erro ao carregar baralho:', error);
                toast.error("Baralho não encontrado. Redirecionando...");
                setStatus('error');
                setTimeout(() => navigate('/community'), 2000);
            }
        };
        loadDeckData();
    }, [deckId, navigate]);

    const stats = useMemo(() => {
        if (!deck) return { total: 0 };
        return { total: deck.card_count || deck.flashcards?.length || 0 };
    }, [deck]);

    const handleStudy = () => {
        navigate(`/study/community/${deckId}`);
    };

    const handleClone = async () => {
        setIsCloning(true);

        const promise = cloneDeck(deckId);

        toast.promise(promise, {
            loading: `A clonar "${deck.title}"...`,
            success: (result) => {
                setIsCloning(false);
                navigate(`/deck/${result.deck.id}`);
                return `Baralho clonado com sucesso! Agora é seu.`;
            },
            error: (err) => {
                setIsCloning(false);
                return err.message || 'Não foi possível clonar o baralho.';
            },
        });
    };

    const handleRateDeck = async (rating) => {
        setIsRatingModalOpen(false);

        // Backup dos valores atuais
        const oldAverageRating = averageRating;
        const oldRatingCount = ratingCount;

        try {
            const response = await rateDeck(deckId, rating);

            // Verificar se é atualização ou nova avaliação
            const isUpdate = response.isUpdate;
            const previousRating = response.previousRating;

            let newAverageRating, newRatingCount;

            if (isUpdate) {
                // Atualização: remover avaliação anterior e adicionar nova
                newRatingCount = ratingCount;
                newAverageRating = ((averageRating * ratingCount) - previousRating + rating) / ratingCount;
                toast.success('Avaliação atualizada com sucesso!');
            } else {
                // Nova avaliação: incrementar contador
                newRatingCount = ratingCount + 1;
                newAverageRating = ((averageRating * ratingCount) + rating) / newRatingCount;
                toast.success('Obrigado pela sua avaliação!');
            }

            // Atualizar UI com valores corretos
            setAverageRating(newAverageRating);
            setRatingCount(newRatingCount);

        } catch (err) {
            // Reverter em caso de erro
            setAverageRating(oldAverageRating);
            setRatingCount(oldRatingCount);
            toast.error(err.message || 'Não foi possível avaliar.');
        }
    };

    if (status === 'loading') {
        return (
            <>
                <Header />
                <main className="deck-main">
                    <LoadingComponent />
                </main>
            </>
        );
    }

    if (status === 'error' || !deck) {
        return (
            <>
                <Header />
                <main className="deck-main">
                    <h1>Baralho não encontrado</h1>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="deck-main">
                <CommunityDeckHeader
                    deck={deck}
                    onStudy={handleStudy}
                    onClone={handleClone}
                    onRate={() => setIsRatingModalOpen(true)}
                    averageRating={averageRating}
                    ratingCount={ratingCount}
                    isCloning={isCloning}
                />
                <CommunityDeckStats
                    stats={stats}
                    averageRating={averageRating}
                    ratingCount={ratingCount}
                />
                <div className="deck-content-grid" style={{gridTemplateColumns: '1fr'}}>
                    <FlashcardList flashcards={deck.flashcards || []} />
                </div>
            </main>

            <Modal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                title={`Avaliar "${deck.title}"`}
            >
                <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <StarRating rating={averageRating} ratingCount={ratingCount} />
                    </div>
                    <p style={{ marginBottom: '1.5rem' }}>O que achou deste baralho?</p>
                    <div style={{ fontSize: '2rem' }}>
                        <StarRating onRate={handleRateDeck} />
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default CommunityDeckView;