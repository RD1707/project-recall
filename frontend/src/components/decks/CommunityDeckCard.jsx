import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importar o Link
import { cloneDeck, rateDeck } from '../../api/decks';
import { fetchProfile } from '../../api/profile';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import StarRating from '../community/StarRating';

function CommunityDeckCard({ deck }) {
    const [isCloning, setIsCloning] = useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const deckColor = deck.color || '#6366f1';
    const isOwnDeck = currentUser && deck.user_id === currentUser.id;

    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const profile = await fetchProfile();
                setCurrentUser(profile);
            } catch (error) {
                // Não loggar erro pois o usuário pode não estar logado
            }
        };
        loadCurrentUser();
    }, []);

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
        const promise = rateDeck(deck.id, rating);

        toast.promise(promise, {
            loading: 'A submeter avaliação...',
            success: 'Obrigado pela sua avaliação!',
            error: (err) => err.message || 'Não foi possível avaliar.',
        });
    };

    const handleAuthorClick = (e) => {
        e.stopPropagation();
    };

    return (
        <>
            <div className={`community-deck-card ${isOwnDeck ? 'own-deck' : ''}`} style={{ '--deck-color': deckColor }}>
                {isOwnDeck && (
                    <div className="own-deck-badge">
                        <i className="fas fa-crown"></i>
                        <span>Seu Baralho</span>
                    </div>
                )}
                <Link to={`/profile/${deck.author.username}`} className="deck-card__author" onClick={handleAuthorClick}>
                    <div className="author-avatar">
                        {deck.author.avatar_url ? (
                            <img src={deck.author.avatar_url} alt={deck.author.username} />
                        ) : (
                            <span>{deck.author.username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <span className="author-name">{deck.author.username}</span>
                </Link>
                <div className="deck-card__header">
                    <h3>{deck.title}</h3>
                </div>
                <div className="deck-card__body">
                    <p>{deck.description || 'Sem descrição'}</p>
                </div>
                <div className="deck-card__footer">
                    {!isOwnDeck && (
                        <>
                            <button className="rating-button" onClick={openRatingModal}>
                                 <StarRating rating={deck.average_rating} ratingCount={deck.rating_count} />
                            </button>
                            <button onClick={handleCloneClick} className="clone-button" disabled={isCloning}>
                                {isCloning ? (
                                    <><i className="fas fa-spinner fa-spin"></i> A clonar...</>
                                ) : (
                                    <><i className="fas fa-clone"></i> Clonar</>
                                )}
                            </button>
                        </>
                    )}
                    {isOwnDeck && (
                        <div className="own-deck-actions">
                            <Link to={`/deck/${deck.id}`} className="view-deck-btn">
                                <i className="fas fa-eye"></i> Ver Baralho
                            </Link>
                        </div>
                    )}
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