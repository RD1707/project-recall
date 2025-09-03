import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import Header from '../components/common/Header';
import DeckCard from '../components/decks/DeckCard';
import CreateDeckCard from '../components/decks/CreateDeckCard'; 
import Modal from '../components/common/Modal';

import { fetchDecks, createDeck, updateDeck, deleteDeck } from '../api/decks';

import '../assets/css/dashboard.css';

const ActionCard = ({ onClick }) => (
    <div className="action-card">
        <h2>Continue sua jornada de aprendizado</h2>
        <p>Crie um novo baralho para explorar outros tópicos ou aprofundar seus conhecimentos atuais.</p>
        <button className="btn" onClick={onClick}>
            <i className="fas fa-plus"></i> Criar Novo Baralho
        </button>
    </div>
);


function Dashboard() {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFilterMenuVisible, setFilterMenuVisible] = useState(false);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState(null);

  const [formData, setFormData] = useState({ title: '', description: '', color: '#4f46e5' });
  
  const filterMenuRef = useRef(null);

  useEffect(() => {
    const loadDecks = async () => {
      try {
        setIsLoading(true);
        const decksData = await fetchDecks();
        setDecks(decksData);
      } catch (err) {
        setError('Não foi possível carregar os seus baralhos.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDecks();
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
            setFilterMenuVisible(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openCreateModal = () => {
    setFormData({ title: '', description: '', color: '#4f46e5' });
    setCreateModalOpen(true);
  };

  const openEditModal = (deck) => {
    setDeckToEdit(deck);
    setFormData({ title: deck.title, description: deck.description || '', color: deck.color || '#4f46e5' });
    setEditModalOpen(true);
  };

  const closeModal = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeckToEdit(null);
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('O título é obrigatório.');
      return;
    }
    try {
      const { deck: newDeck } = await createDeck(formData);
      setDecks(prevDecks => [newDeck, ...prevDecks]);
      toast.success('Baralho criado com sucesso!');
      closeModal();
    } catch (error) {
       toast.error('Não foi possível criar o baralho.');
    }
  };

  const handleUpdateDeck = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('O título é obrigatório.');
      return;
    }
    try {
      const updatedDeck = await updateDeck(deckToEdit.id, formData);
      setDecks(decks.map(d => (d.id === updatedDeck.id ? updatedDeck : d)));
      toast.success('Baralho atualizado!');
      closeModal();
    } catch (error) {
       toast.error('Não foi possível atualizar o baralho.');
    }
  };

  const handleDeleteDeck = async () => {
    if (!window.confirm(`Tem a certeza de que quer excluir o baralho "${deckToEdit.title}"?`)) {
      return;
    }
    try {
      await deleteDeck(deckToEdit.id);
      setDecks(decks.filter(d => d.id !== deckToEdit.id));
      toast.success('Baralho excluído.');
      closeModal();
    } catch (error) {
        toast.error('Não foi possível excluir o baralho.');
    }
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

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


  const renderContent = () => {
    if (isLoading) return <div className="loading-state">A carregar baralhos...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (decks.length === 0) {
      return (
        <div id="empty-state" className="empty-state">
          <h3>Nenhum baralho encontrado</h3>
          <p>Comece criando seu primeiro baralho de flashcards</p>
          <button onClick={openCreateModal} className="btn btn-primary">Criar Primeiro Baralho</button>
        </div>
      );
    }
    if (filteredDecks.length === 0 && searchTerm) {
      return (
          <div className="empty-state">
              <h3>Nenhum baralho corresponde à sua busca.</h3>
              <p>Tente um termo diferente ou ajuste os filtros.</p>
          </div>
      );
    }
    
    return (
      <div id="decks-grid" className="decks-grid">
        {decks.length > 0 && decks.length < 4 && <ActionCard onClick={openCreateModal} />}
        {filteredDecks.map(deck => (
          <DeckCard key={deck.id} deck={deck} onEdit={() => openEditModal(deck)} />
        ))}
        <CreateDeckCard onClick={openCreateModal} />
      </div>
    );
  };

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
            <div className="filter-dropdown" ref={filterMenuRef}>
              <button className="btn" id="filter-btn" onClick={() => setFilterMenuVisible(!isFilterMenuVisible)}>
                <i className="fas fa-filter"></i> Filtrar
              </button>
              <div className={`dropdown-menu filter-menu ${isFilterMenuVisible ? 'visible' : ''}`}>
                <button className={`dropdown-item ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => { setActiveFilter('all'); setFilterMenuVisible(false); }}>Todos</button>
                <button className={`dropdown-item ${activeFilter === 'recent' ? 'active' : ''}`} onClick={() => { setActiveFilter('recent'); setFilterMenuVisible(false); }}>Mais Recentes</button>
                <button className={`dropdown-item ${activeFilter === 'oldest' ? 'active' : ''}`} onClick={() => { setActiveFilter('oldest'); setFilterMenuVisible(false); }}>Mais Antigos</button>
              </div>
            </div>
            <button onClick={openCreateModal} id="create-deck-btn" className="btn btn-primary">
              <i className="fas fa-plus"></i> Novo Baralho
            </button>
          </div>
        </div>
        <div className="decks-container">{renderContent()}</div>
      </main>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        title="Criar Novo Baralho"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" form="deck-form" className="btn btn-primary">Criar Baralho</button>
          </>
        }
      >
        <form id="deck-form" onSubmit={handleCreateDeck}>
          <div className="form-group">
            <label htmlFor="title">Título do Baralho</label>
            <input type="text" id="title" value={formData.title} onChange={handleFormChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Descrição (Opcional)</label>
            <textarea id="description" rows="3" value={formData.description} onChange={handleFormChange}></textarea>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={closeModal}
        title="Editar Baralho"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <button type="button" className="btn btn-danger" onClick={handleDeleteDeck}>Excluir</button>
            <div>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button type="submit" form="deck-form-edit" className="btn btn-primary">Salvar</button>
            </div>
          </div>
        }
      >
        <form id="deck-form-edit" onSubmit={handleUpdateDeck}>
          <div className="form-group">
            <label htmlFor="title">Título do Baralho</label>
            <input type="text" id="title" value={formData.title} onChange={handleFormChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Descrição (Opcional)</label>
            <textarea id="description" rows="3" value={formData.description} onChange={handleFormChange}></textarea>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Dashboard;