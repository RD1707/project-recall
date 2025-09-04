import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Header from '../components/common/Header';
import AIGenerator from '../components/decks/AIGenerator';
import Modal from '../components/common/Modal';

import { fetchDeckById, fetchFlashcardsByDeckId, shareDeck } from '../api/decks';
import { createFlashcard, updateFlashcard, deleteFlashcard } from '../api/flashcards';

import '../assets/css/deck.css';

// --- Subcomponentes para uma UI mais limpa e organizada ---

// Cabeçalho da página do baralho
const DeckHeader = ({ deck, onShare }) => (
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
                    <span><strong>Estudar Agora</strong><small className="btn-subtitle">Iniciar sessão de revisão</small></span>
                </Link>
                <button onClick={onShare} className="btn btn-secondary">
                    <i className="fas fa-share-alt"></i> Compartilhar
                </button>
            </div>
        </div>
    </section>
);

// Cards de estatísticas
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

// Item individual da lista de flashcards
const FlashcardItem = React.memo(({ card, onEdit, onDelete }) => (
    <div className="flashcard-item" tabIndex={0}>
        <div className="flashcard-content">
            <h3 className="flashcard-question">{card.question}</h3>
            <p className="flashcard-answer">{card.answer}</p>
        </div>
        <div className="flashcard-actions">
            <button className="action-btn" onClick={() => onEdit(card)} title="Editar Card"><i className="fas fa-pencil-alt"></i></button>
            <button className="action-btn" onClick={() => onDelete(card.id)} title="Excluir Card"><i className="fas fa-trash"></i></button>
        </div>
    </div>
));

// Lista de flashcards
const FlashcardList = ({ flashcards, onAdd, onEdit, onDelete }) => (
    <section className="flashcards-section">
        <div className="section-header">
            <h2 className="section-title">Flashcards ({flashcards.length})</h2>
            <button onClick={onAdd} className="btn btn-primary">
                <i className="fas fa-plus"></i> Adicionar Card
            </button>
        </div>
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

// --- Componente Principal da Página de Detalhes do Baralho ---

function DeckDetail() {
    const { deckId } = useParams();
    const navigate = useNavigate();

    const [deck, setDeck] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    
    const [modalState, setModalState] = useState({ type: null, data: null }); // 'add', 'edit', 'share'
    const [formData, setFormData] = useState({ question: '', answer: '' });
    const [shareLink, setShareLink] = useState('');
    
    const pollingIntervalRef = useRef(null);

    // Carregamento inicial
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
        return () => clearInterval(pollingIntervalRef.current); // Limpa o polling ao sair
    }, [deckId, navigate]);

    // Cálculo das estatísticas
    const stats = useMemo(() => {
        const today = new Date();
        const toReview = flashcards.filter(card => !card.due_date || new Date(card.due_date) <= today).length;
        const mastered = flashcards.filter(card => card.interval && card.interval > 21).length;
        return { total: flashcards.length, toReview, mastered };
    }, [flashcards]);

    // Lógica de polling para novos cards
    const handleGenerationStart = useCallback(() => {
        clearInterval(pollingIntervalRef.current);
        const initialCardCount = flashcards.length;
        let attempts = 0;
        
        pollingIntervalRef.current = setInterval(async () => {
            if (attempts > 20) { // Timeout de 60 segundos
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

    // Manipuladores de Modal
    const openModal = (type, data = null) => {
        setModalState({ type, data });
        if (type === 'edit' && data) {
            setFormData({ question: data.question, answer: data.answer });
        } else {
            setFormData({ question: '', answer: '' });
        }
    };
    const closeModal = () => setModalState({ type: null, data: null });

    // Ações CRUD para Flashcards
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
                loading: 'Salvando card...',
                success: `Card ${isEditing ? 'atualizado' : 'adicionado'}!`,
                error: 'Ocorreu um erro.',
            });
            if (isEditing) {
                setFlashcards(prev => prev.map(card => card.id === resultCard.id ? resultCard : card));
            } else {
                setFlashcards(prev => [...prev, resultCard]);
            }
            closeModal();
        } catch (err) { /* Erro já tratado pelo toast.promise */ }
    };
    
    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("Tem certeza que quer excluir este flashcard?")) return;
        try {
            await toast.promise(deleteFlashcard(cardId), {
                loading: 'Excluindo...',
                success: 'Flashcard excluído!',
                error: 'Falha ao excluir.',
            });
            setFlashcards(prev => prev.filter(card => card.id !== cardId));
        } catch (err) { /* Erro já tratado pelo toast.promise */ }
    };

    const handleShare = async () => {
        try {
            const result = await toast.promise(shareDeck(deckId), {
                loading: 'Gerando link...',
                success: 'Link de compartilhamento pronto!',
                error: 'Falha ao gerar link.',
            });
            if (result.shareableLink) {
                setShareLink(result.shareableLink);
                openModal('share');
            }
        } catch (err) { /* Erro já tratado pelo toast.promise */ }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success("Link copiado!");
    };
    
    if (status === 'loading') {
        return <><Header /><main className="deck-main"><h1>Carregando baralho...</h1></main></>;
    }
    
    if (status === 'error' || !deck) {
        return <><Header /><main className="deck-main"><h1>Baralho não encontrado</h1></main></>;
    }

    return (
        <>
            <Header />
            <main className="deck-main">
                <DeckHeader deck={deck} onShare={handleShare} />
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