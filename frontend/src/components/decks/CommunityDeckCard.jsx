import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cloneDeck, rateDeck } from '../../api/decks';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import StarRating from '../community/StarRating';

function CommunityDeckCard({ deck, fromProfile }) {
    const [isCloning, setIsCloning] = useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [averageRating, setAverageRating] = useState(deck.average_rating || 0);
    const [ratingCount, setRatingCount] = useState(deck.rating_count || 0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const navigate = useNavigate();
    const deckColor = deck.color || '#6366f1';

    const handleCloneClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCloning(true);
        
        const promise = cloneDeck(deck.id);

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

    const openRatingModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRatingModalOpen(true);
    };

    const handleRateDeck = async (rating) => {
        setIsRatingModalOpen(false);
        setIsSubmittingRating(true);

        // Backup dos valores atuais
        const oldAverageRating = averageRating;
        const oldRatingCount = ratingCount;

        try {
            const response = await rateDeck(deck.id, rating);

            // Verificar se é atualização ou nova avaliação
            const isUpdate = response.isUpdate;
            const previousRating = response.previousRating;

            let newAverageRating, newRatingCount;

            if (isUpdate) {
                // Atualização: remover avaliação anterior e adicionar nova
                newRatingCount = ratingCount; // Mantém o mesmo número de avaliações
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
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handleAuthorClick = (e) => {
        e.stopPropagation();
    };

    const handleCardClick = () => {
        const url = fromProfile
            ? `/community/deck/${deck.id}?from=profile&username=${fromProfile}`
            : `/community/deck/${deck.id}`;
        navigate(url);
    };

    const handleViewClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = fromProfile
            ? `/community/deck/${deck.id}?from=profile&username=${fromProfile}`
            : `/community/deck/${deck.id}`;
        navigate(url);
    };

    return (
        <>
            <div className="community-deck-card" style={{ '--deck-color': deckColor }} onClick={handleCardClick}>
                <Link to={`/profile/${deck.author?.username || 'unknown'}`} className="deck-card__author" onClick={handleAuthorClick}>
                    <div className="author-avatar">
                        {deck.author?.avatar_url ? (
                            <img src={deck.author?.avatar_url} alt={deck.author?.username || 'Autor'} />
                        ) : (
                            <span>{(deck.author?.username || 'A').charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <span className="author-name">{deck.author?.username || 'Autor Desconhecido'}</span>
                </Link>
                <div className="deck-card__header">
                    <h3>{deck.title}</h3>
                </div>
                <div className="deck-card__body">
                    <p>{deck.description || 'Sem descrição'}</p>
                </div>
                <div className="deck-card__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                    <button 
                        className="rating-button" 
                        onClick={openRatingModal} 
                        disabled={isSubmittingRating}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}
                    >
                        <div style={{ display: 'flex', gap: '0.25rem', fontSize: '0.9rem' }}>
                            <StarRating rating={averageRating} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {ratingCount} {ratingCount === 1 ? 'avaliação' : 'avaliações'}
                        </span>
                        {isSubmittingRating && <i className="fas fa-spinner fa-spin" style={{fontSize: '0.8rem'}}></i>}
                    </button>
                    <div className="deck-card__actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={handleCloneClick} className="clone-button" disabled={isCloning} style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', minWidth: '90px' }}>
                            {isCloning ? (
                                <><i className="fas fa-spinner fa-spin"></i> A clonar...</>
                            ) : (
                                <><i className="fas fa-clone"></i> Clonar</>
                            )}
                        </button>
                        <button onClick={handleViewClick} className="btn btn-primary btn-small" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', minWidth: '90px' }}>
                            <i className="fas fa-eye"></i> Ver Baralho
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                title={`Avaliar "${deck.title}"`}
            >
                <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ marginBottom: '1.5rem' }}>O que achou deste baralho?</p>
                    <div style={{ fontSize: '2rem' }}>
                        <StarRating onRate={handleRateDeck} />
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default CommunityDeckCard;