import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import Header from '../components/common/Header';
import DeckCard from '../components/decks/DeckCard';
import Modal from '../components/common/Modal'; 

import { fetchDecks, createDeck, updateDeck, deleteDeck } from '../api/decks';

import '../assets/css/dashboard.css';

function Dashboard() {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState(null); 
  
  const [formData, setFormData] = useState({ title: '', description: '' });

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
  
  const openCreateModal = () => {
    setFormData({ title: '', description: '' });
    setCreateModalOpen(true);
  };
  
  const openEditModal = (deck) => {
    setDeckToEdit(deck);
    setFormData({ title: deck.title, description: deck.description || '' });
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
      const newDeck = await createDeck(formData);
      setDecks([newDeck, ...decks]); 
      toast.success('Baralho criado com sucesso!');
      closeModal();
    } catch (error) {
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
    }
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const renderContent = () => {
    if (isLoading) return <div className="loading-state">A carregar baralhos...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (decks.length === 0) {
      return (
        <div id="empty-state" className="empty-state">
          <h3>Nenhum baralho encontrado</h3>
          <button onClick={openCreateModal} className="btn btn-primary">Criar Primeiro Baralho</button>
        </div>
      );
    }
    return (
      <div id="decks-grid" className="decks-grid">
        {decks.map(deck => (
          <DeckCard key={deck.id} deck={deck} onEdit={() => openEditModal(deck)} />
        ))}
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