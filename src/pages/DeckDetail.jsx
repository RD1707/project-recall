import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Header from '../components/common/Header';
import AIGenerator from '../components/decks/AIGenerator';
import Modal from '../components/common/Modal';

import { fetchDeckById, fetchFlashcardsByDeckId, shareDeck } from '../api/decks';
import { createFlashcard, updateFlashcard, deleteFlashcard } from '../api/flashcards';

import '../assets/css/deck.css';

function DeckDetail() {
    const { deckId } = useParams();
    const navigate = useNavigate();

    const [deck, setDeck] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [cardToEdit, setCardToEdit] = useState(null);
    const [shareLink, setShareLink] = useState('');
    const [formData, setFormData] = useState({ question: '', answer: '' });

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
        const maxAttempts = 20;
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
        }, 3000);
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
                toast.error("Baralho não encontrado. Redirecionando...");
                setTimeout(() => navigate('/dashboard'), 2000);
            } finally {
                setIsLoading(false);
            }
        };
        loadDeckData();
        return () => stopPolling();
    }, [deckId, navigate]);

    const stats = useMemo(() => {
        const today = new Date();
        const toReview = flashcards.filter(card => !card.due_date || new Date(card.due_date) <= today).length;
        const mastered = flashcards.filter(card => card.interval && card.interval > 21).length; // Intervalo de 21 dias para "dominado"
        return {
            total: flashcards.length,
            toReview,
            mastered
        };
    }, [flashcards]);

    const handleOpenEditModal = (card) => {
        setCardToEdit(card);
        setFormData({ question: card.question, answer: card.answer });
        setEditModalOpen(true);
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("Tem certeza que quer excluir este flashcard?")) return;
        try {
            await deleteFlashcard(cardId);
            setFlashcards(prev => prev.filter(card => card.id !== cardId));
            toast.success("Flashcard excluído!");
        } catch (err) { }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.question || !formData.answer) {
            toast.error("Pergunta e resposta são obrigatórias.");
            return;
        }
        try {
            const newCard = await createFlashcard(deckId, formData);
            setFlashcards(prev => [...prev, newCard]);
            toast.success("Flashcard adicionado com sucesso!");
            setAddModalOpen(false);
        } catch (err) { }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!formData.question || !formData.answer) {
            toast.error("Pergunta e resposta são obrigatórias.");
            return;
        }
        try {
            const updatedCard = await updateFlashcard(cardToEdit.id, formData);
            setFlashcards(prev => prev.map(card => card.id === cardToEdit.id ? updatedCard : card));
            toast.success("Flashcard atualizado!");
            setEditModalOpen(false);
        } catch (err) { }
    };

    const handleShare = async () => {
        try {
            const result = await shareDeck(deckId);
            if (result.shareableLink) {
                setShareLink(result.shareableLink);
                setShareModalOpen(true);
            }
        } catch (err) { }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success("Link copiado para a área de transferência!");
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="deck-main">
                    <h1>Carregando baralho...</h1>
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
                        <Link to="/dashboard" className="back-btn"><i className="fas fa-arrow-left"></i> Voltar aos Baralhos</Link>
                        <div className="deck-info">
                            <h1 id="deck-title-heading">{deck.title}</h1>
                            <p className="deck-description">{deck.description || 'Sem descrição'}</p>
                        </div>
                        <div className="deck-actions">
                            <Link to={`/study/${deck.id}`} className="btn btn-primary btn-large">
                                <span><strong>Estudar Agora</strong><small className="btn-subtitle">Começar sessão de estudo</small></span>
                            </Link>
                            <button onClick={handleShare} className="btn btn-secondary">Compartilhar</button>
                        </div>
                    </div>
                </section>

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

                <div className="deck-content-grid">
                    <section className="flashcards-section">
                        <div className="section-header">
                            <h2 className="section-title">Flashcards ({flashcards.length})</h2>
                            <button onClick={() => setAddModalOpen(true)} className="btn btn-primary">Adicionar Card</button>
                        </div>
                        <div className="flashcards-grid">
                            {flashcards.length > 0 ? (
                                flashcards.map(card => (
                                    <div key={card.id} className="flashcard-item">
                                        <div className="flashcard-content">
                                            <h3 className="flashcard-question">{card.question}</h3>
                                            <p className="flashcard-answer">{card.answer}</p>
                                        </div>
                                        <div className="flashcard-actions">
                                            <button className="action-btn" onClick={() => handleOpenEditModal(card)} title="Editar">
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                            <button className="action-btn" onClick={() => handleDeleteCard(card.id)} title="Excluir">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <i className="fas fa-box-open empty-state-icon"></i>
                                    <h3>Nenhum flashcard ainda</h3>
                                    <p>Use o gerador com IA para começar!</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <AIGenerator deckId={deckId} onGenerationStart={startPolling} />
                </div>
            </main>

            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Novo Flashcard" footer={
                <><button className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>Cancelar</button>
                    <button type="submit" form="add-card-form" className="btn btn-primary">Adicionar</button></>
            }>
                <form id="add-card-form" onSubmit={handleAddSubmit}>
                    <div className="form-group"><label>Pergunta</label><textarea required onChange={(e) => setFormData({ ...formData, question: e.target.value })}></textarea></div>
                    <div className="form-group"><label>Resposta</label><textarea required onChange={(e) => setFormData({ ...formData, answer: e.target.value })}></textarea></div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Flashcard" footer={
                <><button className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancelar</button>
                    <button type="submit" form="edit-card-form" className="btn btn-primary">Salvar</button></>
            }>
                <form id="edit-card-form" onSubmit={handleEditSubmit}>
                    <div className="form-group"><label>Pergunta</label><textarea required value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })}></textarea></div>
                    <div className="form-group"><label>Resposta</label><textarea required value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })}></textarea></div>
                </form>
            </Modal>

            <Modal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} title="Compartilhar Baralho">
                <p>Qualquer pessoa com este link poderá ver o conteúdo deste baralho.</p>
                <div className="share-link-container">
                    <input type="text" value={shareLink} readOnly />
                    <button className="btn btn-secondary" onClick={copyToClipboard}>Copiar</button>
                </div>
            </Modal>
        </>
    );
}

export default DeckDetail;