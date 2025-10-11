import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import DeckCard from '../components/decks/DeckCard';
import CreateDeckCard from '../components/decks/CreateDeckCard';
import Modal from '../components/common/Modal';
import { fetchDecks, createDeck, updateDeck, deleteDeck } from '../api/decks';
import { supabase } from '../api/supabaseClient';
import { markOnboardingAsComplete } from '../api/profile';
import OnboardingTour from '../components/common/OnboardingTour';
import { useAchievementActions } from '../hooks/useAchievementActions';
import { STUDY_AREAS, searchAreas } from '../constants/studyAreas';

import '../assets/css/dashboard.css';

const SkeletonDeckCard = () => (
    <div className="skeleton-deck">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-button"></div>
    </div>
);

const DeckForm = ({ onSubmit, initialData = { title: '', description: '', color: '#6366f1', tags: [] }, formId }) => {
    const [formData, setFormData] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAreaSelection, setShowAreaSelection] = useState(false);
    const [filteredAreas, setFilteredAreas] = useState(STUDY_AREAS);

    const colors = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    const MAX_TAGS = 3;

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleColorChange = (color) => {
        setFormData(prev => ({ ...prev, color }));
    };

    // Funções para gerenciar tags (adaptadas do EditProfileModal)
    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setFilteredAreas(searchAreas(term));
    };

    const addTag = (area) => {
        if (formData.tags.length >= MAX_TAGS) return;

        const exists = formData.tags.some(tag => tag.name === area.name);
        if (exists) return;

        const newTag = { name: area.name, color: area.color };
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
        setShowAreaSelection(false);
        setSearchTerm('');
        setFilteredAreas(STUDY_AREAS);
    };

    const removeTag = (index) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const closeAreaSelection = () => {
        setShowAreaSelection(false);
        setSearchTerm('');
        setFilteredAreas(STUDY_AREAS);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeAreaSelection();
        }
    };

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showAreaSelection) {
                closeAreaSelection();
            }
        };

        if (showAreaSelection) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [showAreaSelection]);

    return (
        <>
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

                {/* Seção de Tags */}
                <div className="form-group">
                    <label>Áreas de Estudo</label>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0.5rem 0' }}>
                        Selecione até {MAX_TAGS} áreas relacionadas ao conteúdo do baralho
                    </p>

                    {/* Tags Selecionadas */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {formData.tags.map((tag, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'white',
                                    backgroundColor: tag.color,
                                    gap: '0.5rem'
                                }}
                            >
                                <span>{tag.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        padding: '0',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    aria-label={`Remover ${tag.name}`}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Botão para adicionar nova tag */}
                    {formData.tags.length < MAX_TAGS && (
                        <button
                            type="button"
                            onClick={() => setShowAreaSelection(true)}
                            style={{
                                padding: '0.75rem 1rem',
                                border: '1px dashed var(--color-border)',
                                borderRadius: '8px',
                                background: 'transparent',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                width: '100%',
                                justifyContent: 'center'
                            }}
                        >
                            <i className="fas fa-plus"></i>
                            Adicionar área de estudo
                        </button>
                    )}

                    <div style={{
                        fontSize: '0.8rem',
                        color: formData.tags.length >= MAX_TAGS ? 'var(--color-danger)' : 'var(--color-text-muted)',
                        marginTop: '0.5rem'
                    }}>
                        {formData.tags.length} de {MAX_TAGS} áreas selecionadas
                    </div>
                </div>
            </form>

            {/* Modal de seleção de áreas */}
            {showAreaSelection && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={handleBackdropClick}
                >
                    <div
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--color-text-default)' }}>Selecionar Área de Estudo</h3>
                            <button
                                type="button"
                                onClick={closeAreaSelection}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)'
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Campo de busca */}
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Buscar área de estudo..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    paddingRight: '2.5rem',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    background: 'var(--color-background)',
                                    color: 'var(--color-text-default)'
                                }}
                                autoFocus
                            />
                            <i className="fas fa-search" style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)'
                            }}></i>
                        </div>

                        {/* Lista de áreas */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            {filteredAreas.map((area, index) => {
                                const isSelected = formData.tags.some(tag => tag.name === area.name);
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => addTag(area)}
                                        disabled={isSelected || formData.tags.length >= MAX_TAGS}
                                        style={{
                                            padding: '0.75rem',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            background: isSelected ? 'var(--color-background)' : 'transparent',
                                            color: isSelected ? 'var(--color-text-muted)' : 'var(--color-text-default)',
                                            cursor: isSelected || formData.tags.length >= MAX_TAGS ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            opacity: isSelected ? 0.6 : 1,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '500' }}>{area.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: area.color }}>{area.category}</div>
                                        </div>
                                        {isSelected && <i className="fas fa-check" style={{ color: 'var(--color-success)' }}></i>}
                                    </button>
                                );
                            })}
                        </div>

                        {filteredAreas.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: 'var(--color-text-muted)'
                            }}>
                                <i className="fas fa-search" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                                <p>Nenhuma área encontrada</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};


function Dashboard() {
    const { triggerAchievementUpdate } = useAchievementActions();
    const [decks, setDecks] = useState([]);
    const [status, setStatus] = useState('loading');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: null,
        deckData: null,
    });
    
    const [showTour, setShowTour] = useState(false); 

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setStatus('loading');
                
                const decksData = await fetchDecks();
                setDecks(decksData);

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('has_completed_onboarding')
                        .eq('id', user.id)
                        .single();

                    if (error && error.code !== 'PGRST116') throw error;
                    
                    if (profile && !profile.has_completed_onboarding) {
                        setTimeout(() => setShowTour(true), 500);
                    }
                }

                setStatus('success');
            } catch (err) {
                setStatus('error');
                toast.error('Não foi possível carregar seus dados.');
            }
        };
        loadInitialData();
    }, []);
    
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

    const openModal = (mode, deckData = null) => {
        setModalState({ isOpen: true, mode, deckData });
    };
    const closeModal = () => {
        setModalState({ isOpen: false, mode: null, deckData: null });
    };

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
                // Trigger achievement update after creating deck
                triggerAchievementUpdate('create_deck');
            } else {
                setDecks(decks.map(d => (d.id === resultDeck.id ? resultDeck : d)));
            }
            closeModal();
        } catch (error) {
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
        }
    };
    
    const handleTourComplete = async () => {
        setShowTour(false);
        try {
            await markOnboardingAsComplete();
        } catch (error) {
            console.error("Não foi possível salvar o status do tour.", error);
        }
    };

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
    const formInitialData = isEditing
        ? { ...modalState.deckData, tags: modalState.deckData.tags || [] }
        : { title: '', description: '', color: '#6366f1', tags: [] };

    return (
        <>
            {showTour && <OnboardingTour onComplete={handleTourComplete} />}
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
                    initialData={formInitialData}
                />
            </Modal>
        </>
    );
}

export default Dashboard;