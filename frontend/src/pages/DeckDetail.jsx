import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Header from '../components/common/Header';
import AIGenerator from '../components/decks/AIGenerator';
import Modal from '../components/common/Modal';
import { useSocket } from '../context/SocketContext'; 

import { fetchDeckById, fetchFlashcardsByDeckId, shareDeck } from '../api/decks';
import { createFlashcard, updateFlashcard, deleteFlashcard } from '../api/flashcards';
import { fetchProfile } from '../api/profile';
import { useAchievementActions } from '../hooks/useAchievementActions';

import '../assets/css/deck.css';

const LoadingComponent = () => (
    <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Carregando baralho...</h2>
    </div>
);

const DeckHeader = ({ deck, onShare, onCreateQuiz, isCreatingQuiz }) => ( 
    <section className="deck-hero">
        <div className="hero-content">
            <Link to="/dashboard" className="back-btn"><i className="fas fa-arrow-left"></i> Voltar aos Baralhos</Link>
            <div className="deck-info">
                <h1 id="deck-title-heading">{deck.title}</h1>
                <p className="deck-description">{deck.description || 'Sem descrição para este baralho.'}</p>
            </div>
            <div className="deck-actions">
                <Link to={`/study/${deck.id}`} className="btn btn-primary btn-large">
                    <i className="fas fa-play-circle"></i>
                    <span><strong>Estudar Sozinho</strong></span>
                </Link>
                <button onClick={onCreateQuiz} className="btn btn-secondary btn-large" disabled={isCreatingQuiz}>
                    <i className={isCreatingQuiz ? "fas fa-spinner fa-spin" : "fas fa-users"}></i>
                    <span>{isCreatingQuiz ? 'A criar sala...' : 'Jogar Quiz em Grupo'}</span>
                </button>
                <button onClick={onShare} className="btn btn-secondary">
                    <i className="fas fa-share-alt"></i> Compartilhar
                </button>
            </div>
        </div>
    </section>
);

const DeckStats = ({ stats }) => (
    <div className="deck-stats-container">
        <div className="stat-card">
            <div className="stat-icon-container"><i className="fas fa-layer-group stat-main-icon"></i></div>
            <div className="stat-content"><span className="stat-number">{stats.total}</span><span className="stat-label">Total de Cards</span></div>
        </div>
        <div className="stat-card">
            <div className="stat-icon-container"><i className="fas fa-clock stat-main-icon"></i></div>
            <div className="stat-content"><span className="stat-number">{stats.toReview}</span><span className="stat-label">Para Revisar Hoje</span></div>
        </div>
        <div className="stat-card">
            <div className="stat-icon-container"><i className="fas fa-award stat-main-icon"></i></div>
            <div className="stat-content"><span className="stat-number">{stats.mastered}</span><span className="stat-label">Dominados</span></div>
        </div>
    </div>
);

const FlashcardItem = React.memo(({ card, onEdit, onDelete }) => {
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
            <div className="flashcard-actions">
                <button className="action-btn" onClick={() => onEdit(card)} title="Editar Card"><i className="fas fa-pencil-alt"></i></button>
                <button className="action-btn" onClick={() => onDelete(card.id)} title="Excluir Card"><i className="fas fa-trash"></i></button>
            </div>
        </div>
    );
});


const FlashcardList = ({ flashcards, onAdd, onEdit, onDelete }) => (
    <section className="flashcards-section">
        <div className="flashcards-grid">
            {flashcards.length > 0 ? (
                flashcards.map(card => (
                    <FlashcardItem key={card.id} card={card} onEdit={onEdit} onDelete={onDelete} />
                ))
            ) : (
                <div className="empty-state">
                    <i className="fas fa-box-open empty-state-icon"></i>
                    <h3>Nenhum flashcard ainda</h3>
                    <p>Adicione um manualmente ou use o gerador com IA para começar!</p>
                </div>
            )}
        </div>
    </section>
);


function DeckDetail() {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const socket = useSocket();
    const { triggerAchievementUpdate } = useAchievementActions(); 

    const [deck, setDeck] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [status, setStatus] = useState('loading');
    const [isCreatingQuiz, setIsCreatingQuiz] = useState(false); 
    const [currentUser, setCurrentUser] = useState(null); 
    
    const [modalState, setModalState] = useState({ type: null, data: null }); 
    const [formData, setFormData] = useState({ question: '', answer: '' });
    const [shareLink, setShareLink] = useState('');
    
    const pollingIntervalRef = useRef(null);

    useEffect(() => {
        const loadDeckData = async () => {
            setStatus('loading');
            try {
                const [deckData, flashcardsData] = await Promise.all([
                    fetchDeckById(deckId),
                    fetchFlashcardsByDeckId(deckId)
                ]);
                setDeck(deckData);
                setFlashcards(flashcardsData);
                setStatus('success');
            } catch (error) {
                toast.error("Baralho não encontrado. Redirecionando...");
                setStatus('error');
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        };
        loadDeckData();
        return () => clearInterval(pollingIntervalRef.current); 
    }, [deckId, navigate]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await fetchProfile();
                if (profile) {
                    setCurrentUser(profile);
                }
            } catch (error) {
                toast.error("Não foi possível carregar os seus dados de perfil.");
            }
        };
        loadProfile();
    }, []);

    const stats = useMemo(() => {
        const today = new Date();
        const toReview = flashcards.filter(card => !card.due_date || new Date(card.due_date) <= today).length;
        const mastered = flashcards.filter(card => card.interval && card.interval > 21).length;
        return { total: flashcards.length, toReview, mastered };
    }, [flashcards]);

    const handleGenerationStart = useCallback(() => {
        clearInterval(pollingIntervalRef.current);
        const initialCardCount = flashcards.length;
        let attempts = 0;
        
        pollingIntervalRef.current = setInterval(async () => {
            if (attempts > 20) {
                toast.error("A geração demorou mais que o esperado.");
                clearInterval(pollingIntervalRef.current);
                return;
            }
            try {
                const updatedFlashcards = await fetchFlashcardsByDeckId(deckId);
                if (updatedFlashcards.length > initialCardCount) {
                    const newCardsCount = updatedFlashcards.length - initialCardCount;
                    toast.success(`${newCardsCount} novo(s) card(s) adicionado(s)!`);
                    setFlashcards(updatedFlashcards);
                    clearInterval(pollingIntervalRef.current);
                }
            } catch (error) {
                toast.error("Erro ao verificar novos cards.");
                clearInterval(pollingIntervalRef.current);
            }
            attempts++;
        }, 3000);
    }, [deckId, flashcards.length]);

    const openModal = (type, data = null) => {
        setModalState({ type, data });
        if (type === 'edit' && data) {
            setFormData({ question: data.question, answer: data.answer });
        } else {
            setFormData({ question: '', answer: '' });
        }
    };
    const closeModal = () => setModalState({ type: null, data: null });

    const handleSaveCard = async (e) => {
        e.preventDefault();
        if (!formData.question.trim() || !formData.answer.trim()) {
            toast.error("Pergunta e resposta são obrigatórias.");
            return;
        }

        const isEditing = modalState.type === 'edit';
        const action = isEditing
            ? updateFlashcard(modalState.data.id, formData)
            : createFlashcard(deckId, formData);

        try {
            const resultCard = await toast.promise(action, {
                loading: 'A salvar card...',
                success: `Card ${isEditing ? 'atualizado' : 'adicionado'}!`,
                error: 'Ocorreu um erro.',
            });
            if (isEditing) {
                setFlashcards(prev => prev.map(card => card.id === resultCard.id ? resultCard : card));
            } else {
                setFlashcards(prev => [resultCard, ...prev]);
                // Trigger achievement update after creating flashcard
                triggerAchievementUpdate('create_card');
            }
            closeModal();
        } catch (err) {}
    };
    
    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("Tem a certeza que quer excluir este flashcard?")) return;
        try {
            await toast.promise(deleteFlashcard(cardId), {
                loading: 'A excluir...',
                success: 'Flashcard excluído!',
                error: 'Falha ao excluir.',
            });
            setFlashcards(prev => prev.filter(card => card.id !== cardId));
        } catch (err) {}
    };

    const handleShare = async () => {
        try {
            const result = await toast.promise(shareDeck(deckId), {
                loading: 'A gerar link...',
                success: 'Link de partilha pronto!',
                error: 'Falha ao gerar link.',
            });
            if (result.shareableLink) {
                setShareLink(result.shareableLink);
                openModal('share');
            }
        } catch (err) {}
    };
    
    const handleCreateQuiz = () => {
        if (!currentUser) {
            toast.error("Os seus dados de perfil ainda estão a carregar. Tente novamente em um instante.");
            return;
        }
        setIsCreatingQuiz(true);
        socket.emit('quiz:create', { deckId, user: currentUser }, (response) => {
            setIsCreatingQuiz(false);
            if (response.success) {
                navigate(`/quiz/${response.roomId}`);
            } else {
                toast.error(response.message || "Não foi possível criar o quiz.");
            }
        });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success("Link copiado!");
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
                <DeckHeader 
                    deck={deck} 
                    onShare={handleShare} 
                    onCreateQuiz={handleCreateQuiz} 
                    isCreatingQuiz={isCreatingQuiz}
                />
                <DeckStats stats={stats} />
                <div className="deck-content-grid">
                    <FlashcardList
                        flashcards={flashcards}
                        onAdd={() => openModal('add')}
                        onEdit={(card) => openModal('edit', card)}
                        onDelete={handleDeleteCard}
                    />
                    <AIGenerator deckId={deckId} onGenerationStart={handleGenerationStart} />
                </div>
            </main>

            <Modal 
                isOpen={modalState.type === 'add' || modalState.type === 'edit'} 
                onClose={closeModal} 
                title={modalState.type === 'edit' ? "Editar Flashcard" : "Adicionar Novo Flashcard"}
            >
                <form id="card-form" onSubmit={handleSaveCard}>
                    <div className="form-group">
                        <label htmlFor="question">Pergunta</label>
                        <textarea id="question" required value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} rows="4"></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="answer">Resposta</label>
                        <textarea id="answer" required value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} rows="4"></textarea>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={modalState.type === 'share'} onClose={closeModal} title="Compartilhar Baralho">
                <div className="modal-body">
                    <p>Qualquer pessoa com este link poderá visualizar os flashcards deste baralho.</p>
                    <div className="share-link-container">
                        <input type="text" value={shareLink} readOnly />
                        <button className="btn btn-primary" onClick={copyToClipboard}>Copiar</button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default DeckDetail;