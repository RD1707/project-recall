import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import DeckCard from '../components/decks/DeckCard';
import CreateDeckCard from '../components/decks/CreateDeckCard';
import Modal from '../components/common/Modal';
import { fetchDecks, createDeck, updateDeck, deleteDeck } from '../api/decks';

import '../assets/css/dashboard.css';

// ========== COMPONENTES MEMOIZADOS ==========

const SkeletonDeckCard = memo(() => (
    <div className="skeleton-deck">
        <div className="skeleton-wave">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-footer"></div>
        </div>
    </div>
));

const FilterPill = memo(({ label, value, activeFilter, onClick, icon }) => (
    <button
        className={`filter-pill ${activeFilter === value ? 'active' : ''}`}
        onClick={() => onClick(value)}
        aria-label={`Filtrar por ${label}`}
    >
        {icon && <i className={`fas fa-${icon}`}></i>}
        <span>{label}</span>
    </button>
));

const DeckForm = memo(({ onSubmit, initialData = { title: '', description: '', color: '#6366f1' }, formId }) => {
    const [formData, setFormData] = useState(initialData);
    const [titleError, setTitleError] = useState('');

    const colors = [
        { value: '#6366f1', name: 'Índigo' },
        { value: '#ef4444', name: 'Vermelho' },
        { value: '#f59e0b', name: 'Âmbar' },
        { value: '#10b981', name: 'Esmeralda' },
        { value: '#3b82f6', name: 'Azul' },
        { value: '#8b5cf6', name: 'Violeta' },
        { value: '#ec4899', name: 'Rosa' },
        { value: '#14b8a6', name: 'Teal' }
    ];

    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        
        if (id === 'title') {
            setTitleError(value.trim() ? '' : 'O título é obrigatório');
        }
    }, []);

    const handleColorChange = useCallback((color) => {
        setFormData(prev => ({ ...prev, color }));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setTitleError('O título é obrigatório');
            return;
        }
        onSubmit(formData);
    };

    return (
        <form id={formId} onSubmit={handleSubmit} className="deck-form">
            <div className="form-group">
                <label htmlFor="title">
                    Título do Baralho
                    <span className="required">*</span>
                </label>
                <input 
                    type="text" 
                    id="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="Ex: Biologia Celular"
                    className={titleError ? 'error' : ''}
                    autoFocus
                    maxLength={50}
                />
                {titleError && <span className="error-message">{titleError}</span>}
                <span className="char-count">{formData.title.length}/50</span>
            </div>
            
            <div className="form-group">
                <label htmlFor="description">
                    Descrição
                    <span className="optional">(Opcional)</span>
                </label>
                <textarea 
                    id="description" 
                    rows="3" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Descreva brevemente o conteúdo deste baralho"
                    maxLength={200}
                />
                <span className="char-count">{formData.description?.length || 0}/200</span>
            </div>
            
            <div className="form-group">
                <label>Cor do Baralho</label>
                <div className="color-picker-grid">
                    {colors.map(({ value, name }) => (
                        <button
                            key={value}
                            type="button"
                            className={`color-option ${formData.color === value ? 'selected' : ''}`}
                            style={{ backgroundColor: value }}
                            onClick={() => handleColorChange(value)}
                            aria-label={`Cor ${name}`}
                            title={name}
                        >
                            {formData.color === value && <i className="fas fa-check"></i>}
                        </button>
                    ))}
                </div>
            </div>
        </form>
    );
});

const EmptyState = memo(({ searchTerm, onCreateDeck }) => {
    if (searchTerm) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <i className="fas fa-search"></i>
                </div>
                <h3>Nenhum resultado encontrado</h3>
                <p>Não encontramos baralhos para "{searchTerm}"</p>
                <button className="btn btn-ghost" onClick={() => window.location.reload()}>
                    Limpar busca
                </button>
            </div>
        );
    }

    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <i className="fas fa-layer-group"></i>
            </div>
            <h3>Comece sua jornada de aprendizado</h3>
            <p>Crie seu primeiro baralho de flashcards e transforme a forma como você estuda</p>
            <button onClick={onCreateDeck} className="btn btn-primary btn-lg">
                <i className="fas fa-plus"></i>
                Criar Primeiro Baralho
            </button>
        </div>
    );
});

// ========== COMPONENTE PRINCIPAL ==========

function Dashboard() {
    const navigate = useNavigate();
    
    // Estados principais
    const [decks, setDecks] = useState([]);
    const [status, setStatus] = useState('loading');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // grid ou list
    
    // Estado do modal
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: null,
        deckData: null,
    });

    // Estatísticas dos baralhos
    const stats = useMemo(() => {
        const total = decks.length;
        const totalCards = decks.reduce((sum, deck) => sum + (deck.card_count || 0), 0);
        const recentDecks = decks.filter(deck => {
            const created = new Date(deck.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created > weekAgo;
        }).length;

        return { total, totalCards, recentDecks };
    }, [decks]);

    // Carregar baralhos
    useEffect(() => {
        const loadDecks = async () => {
            try {
                setStatus('loading');
                await new Promise(resolve => setTimeout(resolve, 600)); // Delay suave
                const decksData = await fetchDecks();
                setDecks(decksData);
                setStatus('success');
            } catch (err) {
                setStatus('error');
                toast.error('Erro ao carregar seus baralhos. Tente novamente.');
            }
        };
        loadDecks();
    }, []);

    // Filtrar e ordenar baralhos
    const filteredDecks = useMemo(() => {
        let result = [...decks];

        // Aplicar busca
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(deck =>
                deck.title.toLowerCase().includes(term) ||
                deck.description?.toLowerCase().includes(term)
            );
        }

        // Aplicar filtros
        switch (activeFilter) {
            case 'recent':
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                result = result.slice(0, 6); // Últimos 6
                break;
            case 'favorites':
                result = result.filter(deck => deck.is_favorite);
                break;
            case 'active':
                result = result.filter(deck => deck.card_count > 0);
                break;
            default:
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return result;
    }, [decks, searchTerm, activeFilter]);

    // Handlers do modal
    const openModal = useCallback((mode, deckData = null) => {
        setModalState({ isOpen: true, mode, deckData });
    }, []);

    const closeModal = useCallback(() => {
        setModalState({ isOpen: false, mode: null, deckData: null });
    }, []);

    // Salvar baralho (criar ou editar)
    const handleSaveDeck = useCallback(async (formData) => {
        const isCreating = modalState.mode === 'create';
        
        try {
            const resultDeck = await toast.promise(
                isCreating 
                    ? createDeck(formData)
                    : updateDeck(modalState.deckData.id, formData),
                {
                    loading: `${isCreating ? 'Criando' : 'Salvando'} baralho...`,
                    success: `Baralho ${isCreating ? 'criado' : 'atualizado'} com sucesso!`,
                    error: `Erro ao ${isCreating ? 'criar' : 'salvar'} o baralho.`,
                }
            );
            
            if (isCreating) {
                setDecks(prev => [resultDeck, ...prev]);
            } else {
                setDecks(prev => prev.map(d => d.id === resultDeck.id ? resultDeck : d));
            }
            
            closeModal();
        } catch (error) {
            console.error('Erro ao salvar baralho:', error);
        }
    }, [modalState, closeModal]);

    // Deletar baralho
    const handleDeleteDeck = useCallback(async () => {
        const deck = modalState.deckData;
        
        // Confirmação customizada
        const confirmed = window.confirm(
            `Tem certeza que deseja excluir "${deck.title}"?\n` +
            `${deck.card_count > 0 ? `Isso removerá ${deck.card_count} card(s).` : ''}\n\n` +
            `Esta ação não pode ser desfeita.`
        );
        
        if (!confirmed) return;
        
        try {
            await toast.promise(deleteDeck(deck.id), {
                loading: 'Excluindo baralho...',
                success: 'Baralho excluído com sucesso.',
                error: 'Erro ao excluir o baralho.',
            });
            
            setDecks(prev => prev.filter(d => d.id !== deck.id));
            closeModal();
        } catch (error) {
            console.error('Erro ao excluir baralho:', error);
        }
    }, [modalState.deckData, closeModal]);

    // Renderizar conteúdo principal
    const renderContent = () => {
        if (status === 'loading') {
            return (
                <div className={`decks-${viewMode}`}>
                    {[...Array(6)].map((_, i) => (
                        <SkeletonDeckCard key={`skeleton-${i}`} />
                    ))}
                </div>
            );
        }

        if (status === 'error') {
            return (
                <div className="error-state">
                    <div className="error-state-icon">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Ops! Algo deu errado</h3>
                    <p>Não conseguimos carregar seus baralhos</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        <i className="fas fa-redo"></i> Tentar novamente
                    </button>
                </div>
            );
        }

        if (decks.length === 0) {
            return <EmptyState onCreateDeck={() => openModal('create')} />;
        }

        if (filteredDecks.length === 0) {
            return <EmptyState searchTerm={searchTerm} />;
        }

        return (
            <div className={`decks-${viewMode}`}>
                {filteredDecks.map((deck, index) => (
                    <div
                        key={deck.id}
                        className="deck-wrapper"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <DeckCard 
                            deck={deck} 
                            onEdit={() => openModal('edit', deck)}
                            viewMode={viewMode}
                        />
                    </div>
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
                {/* Estatísticas rápidas */}
                {decks.length > 0 && (
                    <div className="quick-stats">
                        <div className="stat-card">
                            <i className="fas fa-layer-group"></i>
                            <div>
                                <span className="stat-value">{stats.total}</span>
                                <span className="stat-label">Baralhos</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-clone"></i>
                            <div>
                                <span className="stat-value">{stats.totalCards}</span>
                                <span className="stat-label">Cards Total</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-clock"></i>
                            <div>
                                <span className="stat-value">{stats.recentDecks}</span>
                                <span className="stat-label">Esta Semana</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cabeçalho com ações */}
                <div className="content-header">
                    <div className="header-left">
                        <h2>Meus Baralhos</h2>
                        {decks.length > 0 && (
                            <div className="filter-pills">
                                <FilterPill label="Todos" value="all" activeFilter={activeFilter} onClick={setActiveFilter} />
                                <FilterPill label="Recentes" value="recent" activeFilter={activeFilter} onClick={setActiveFilter} icon="clock" />
                                <FilterPill label="Ativos" value="active" activeFilter={activeFilter} onClick={setActiveFilter} icon="play" />
                            </div>
                        )}
                    </div>
                    
                    <div className="header-actions">
                        {decks.length > 0 && (
                            <>
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar baralhos..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        aria-label="Buscar baralhos"
                                    />
                                    {searchTerm && (
                                        <button 
                                            className="clear-search" 
                                            onClick={() => setSearchTerm('')}
                                            aria-label="Limpar busca"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                                
                                <div className="view-toggle">
                                    <button 
                                        className={viewMode === 'grid' ? 'active' : ''}
                                        onClick={() => setViewMode('grid')}
                                        aria-label="Visualização em grade"
                                    >
                                        <i className="fas fa-th"></i>
                                    </button>
                                    <button 
                                        className={viewMode === 'list' ? 'active' : ''}
                                        onClick={() => setViewMode('list')}
                                        aria-label="Visualização em lista"
                                    >
                                        <i className="fas fa-list"></i>
                                    </button>
                                </div>
                            </>
                        )}
                        
                        <button 
                            onClick={() => openModal('create')} 
                            className="btn btn-primary"
                        >
                            <i className="fas fa-plus"></i>
                            <span>Novo Baralho</span>
                        </button>
                    </div>
                </div>

                {/* Conteúdo principal */}
                <div className="decks-container">
                    {renderContent()}
                </div>
            </main>

            {/* Modal de criação/edição */}
            <Modal 
                isOpen={modalState.isOpen} 
                onClose={closeModal} 
                title={isEditing ? "Editar Baralho" : "Criar Novo Baralho"}
                footer={
                    <div className={`modal-footer-actions ${isEditing ? 'edit-mode' : ''}`}>
                        {isEditing && (
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={handleDeleteDeck}
                            >
                                <i className="fas fa-trash"></i>
                                Excluir
                            </button>
                        )}
                        <div className="main-actions">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={closeModal}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                form="deck-form" 
                                className="btn btn-primary"
                            >
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