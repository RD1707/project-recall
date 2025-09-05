import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import DeckCard from '../components/decks/DeckCard';
import CreateDeckCard from '../components/decks/CreateDeckCard';
import Modal from '../components/common/Modal';
import { fetchDecks, createDeck, updateDeck, deleteDeck } from '../api/decks';

import '../assets/css/dashboard.css';

// --- Subcomponentes para um Dashboard mais limpo e organizado ---

// Skeleton Card para o estado de carregamento
const SkeletonDeckCard = () => (
    <div className="skeleton-deck">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-button"></div>
    </div>
);

// Formulário de Criação/Edição de Deck
const DeckForm = ({ onSubmit, initialData = { title: '', description: '', color: '#6366f1' }, formId }) => {
    const [formData, setFormData] = useState(initialData);

    const colors = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleColorChange = (color) => {
        setFormData(prev => ({ ...prev, color }));
    };

    return (
        <form id={formId} onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            <div className="form-group">
                <label htmlFor="title">Título do Baralho</label>
                <input type="text" id="title" value={formData.title} onChange={handleChange} required placeholder="Ex: Biologia Celular" />
            </div>
            <div className="form-group">
                <label htmlFor="description">Descrição (Opcional)</label>
                <textarea id="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Uma breve descrição do conteúdo do baralho"></textarea>
            </div>
            <div className="form-group">
                <label>Cor do Baralho</label>
                <div className="color-picker">
                    {colors.map(color => (
                        <div
                            key={color}
                            className={`color-option ${formData.color === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorChange(color)}
                            role="radio"
                            aria-checked={formData.color === color}
                            aria-label={`Selecionar cor ${color}`}
                            tabIndex={0}
                        ></div>
                    ))}
                </div>
            </div>
        </form>
    );
};

// --- Componente Principal do Dashboard ---

function Dashboard() {
    const [decks, setDecks] = useState([]);
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    
    // Estado unificado para os modais
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: null, // 'create' ou 'edit'
        deckData: null,
    });

    // Carregamento inicial dos decks
    useEffect(() => {
        const loadDecks = async () => {
            try {
                setStatus('loading');
                const decksData = await fetchDecks();
                setDecks(decksData);
                setStatus('success');
            } catch (err) {
                setStatus('error');
                toast.error('Não foi possível carregar seus baralhos.');
            }
        };
        loadDecks();
    }, []);
    
    // Filtragem e ordenação dos decks
    const filteredDecks = useMemo(() => {
        let decksToRender = [...decks];

        if (searchTerm) {
            decksToRender = decksToRender.filter(deck =>
                deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (deck.description && deck.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (activeFilter === 'recent') {
            decksToRender.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (activeFilter === 'oldest') {
            decksToRender.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        return decksToRender;
    }, [decks, searchTerm, activeFilter]);

    // Manipuladores de Modal
    const openModal = (mode, deckData = null) => {
        setModalState({ isOpen: true, mode, deckData });
    };
    const closeModal = () => {
        setModalState({ isOpen: false, mode: null, deckData: null });
    };

    // Ações CRUD
    const handleSaveDeck = async (formData) => {
        if (!formData.title) {
            toast.error('O título é obrigatório.');
            return;
        }

        const isCreating = modalState.mode === 'create';
        const promise = isCreating 
            ? createDeck(formData)
            : updateDeck(modalState.deckData.id, formData);

        try {
            const resultDeck = await toast.promise(promise, {
                loading: `${isCreating ? 'Criando' : 'Salvando'} baralho...`,
                success: `Baralho ${isCreating ? 'criado' : 'atualizado'} com sucesso!`,
                error: `Não foi possível ${isCreating ? 'criar' : 'salvar'} o baralho.`,
            });
            
            if (isCreating) {
                setDecks(prevDecks => [resultDeck, ...prevDecks]);
            } else {
                setDecks(decks.map(d => (d.id === resultDeck.id ? resultDeck : d)));
            }
            closeModal();
        } catch (error) {
            // Toast.promise já lida com a notificação de erro
        }
    };
    
    const handleDeleteDeck = async () => {
        if (!window.confirm(`Tem certeza de que quer excluir o baralho "${modalState.deckData.title}"? Esta ação não pode ser desfeita.`)) {
            return;
        }
        
        try {
            await toast.promise(deleteDeck(modalState.deckData.id), {
                loading: 'Excluindo baralho...',
                success: 'Baralho excluído com sucesso.',
                error: 'Não foi possível excluir o baralho.',
            });
            setDecks(decks.filter(d => d.id !== modalState.deckData.id));
            closeModal();
        } catch (error) {
            // Toast.promise já lida com a notificação de erro
        }
    };

    // Renderização do conteúdo principal
    const renderContent = () => {
        if (status === 'loading') {
            return (
                <div id="decks-grid" className="decks-grid">
                    {[...Array(6)].map((_, i) => <SkeletonDeckCard key={i} />)}
                </div>
            );
        }
        if (status === 'error') {
            return <div className="error-state">Ocorreu um erro ao buscar seus dados.</div>;
        }
        if (decks.length === 0) {
            return (
                <div id="empty-state" className="empty-state">
                    <h3>Nenhum baralho encontrado</h3>
                    <p>Comece sua jornada de aprendizado criando seu primeiro baralho.</p>
                    <button onClick={() => openModal('create')} className="btn btn-primary">Criar Primeiro Baralho</button>
                </div>
            );
        }
        if (filteredDecks.length === 0) {
            return (
                <div className="empty-state">
                    <h3>Nenhum baralho corresponde à sua busca.</h3>
                    <p>Tente um termo diferente ou ajuste os filtros.</p>
                </div>
            );
        }
        return (
            <div id="decks-grid" className="decks-grid">
                {filteredDecks.map(deck => (
                    <DeckCard key={deck.id} deck={deck} onEdit={() => openModal('edit', deck)} />
                ))}
                <CreateDeckCard onClick={() => openModal('create')} />
            </div>
        );
    };

    const isEditing = modalState.mode === 'edit';

    return (
        <>
            <Header />
            <main className="dashboard-main">
                <div className="content-header">
                    <h2>Meus Baralhos</h2>
                    <div className="header-actions">
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input 
                                type="text" 
                                id="deck-search" 
                                placeholder="Buscar baralhos..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        {/* Filtros podem ser adicionados aqui no futuro */}
                        <button onClick={() => openModal('create')} id="create-deck-btn" className="btn btn-primary">
                            <i className="fas fa-plus"></i> Novo Baralho
                        </button>
                    </div>
                </div>
                <div className="decks-container">{renderContent()}</div>
            </main>

            <Modal 
                isOpen={modalState.isOpen} 
                onClose={closeModal} 
                title={isEditing ? "Editar Baralho" : "Criar Novo Baralho"}
                footer={
                    <div className={`modal-footer-actions ${isEditing ? 'edit-mode' : ''}`}>
                        {isEditing && (
                            <button type="button" className="btn btn-danger" onClick={handleDeleteDeck}>Excluir</button>
                        )}
                        <div className="main-actions">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                            <button type="submit" form="deck-form" className="btn btn-primary">
                                {isEditing ? 'Salvar Alterações' : 'Criar Baralho'}
                            </button>
                        </div>
                    </div>
                }
            >
                <DeckForm 
                    formId="deck-form"
                    onSubmit={handleSaveDeck} 
                    initialData={modalState.deckData}
                />
            </Modal>
        </>
    );
}

export default Dashboard;