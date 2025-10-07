import React, { useState } from 'react';
import { useSinapse } from '../../context/SinapseContext';
import toast from 'react-hot-toast';

function ConversationSidebar() {
    const {
        conversations,
        currentConversationId,
        loadingConversations,
        createNewConversation,
        selectConversation,
        deleteConversation,
    } = useSinapse();

    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleNewConversation = async () => {
        try {
            await createNewConversation();
        } catch (error) {
            console.error('Erro ao criar conversa:', error);
            toast.error('Erro ao criar nova conversa');
        }
    };

    const handleDeleteConversation = async (e, conversationId) => {
        e.stopPropagation();

        if (!window.confirm('Tem certeza que deseja deletar esta conversa?')) {
            return;
        }

        setDeletingId(conversationId);
        try {
            await deleteConversation(conversationId);
            toast.success('Conversa deletada com sucesso');
        } catch (error) {
            console.error('Erro ao deletar conversa:', error);
            toast.error('Erro ao deletar conversa');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ontem';
        } else if (diffDays < 7) {
            return `${diffDays} dias atrás`;
        } else {
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        }
    };

    return (
        <div className="sinapse-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-title">
                    <i className="fas fa-brain"></i>
                    <h3>Sinapse</h3>
                </div>
                <button
                    className="btn-new-conversation"
                    onClick={handleNewConversation}
                    title="Nova Conversa"
                >
                    <i className="fas fa-plus"></i>
                </button>
            </div>

            <div className="sidebar-search">
                <i className="fas fa-search"></i>
                <input
                    type="text"
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="conversations-list">
                {loadingConversations ? (
                    <div className="loading-conversations">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Carregando conversas...</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="no-conversations">
                        <i className="fas fa-comments"></i>
                        <p>
                            {searchTerm
                                ? 'Nenhuma conversa encontrada'
                                : 'Nenhuma conversa ainda'}
                        </p>
                        {!searchTerm && (
                            <button
                                className="btn-start-conversation"
                                onClick={handleNewConversation}
                            >
                                Começar Conversa
                            </button>
                        )}
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`conversation-item ${
                                conv.id === currentConversationId ? 'active' : ''
                            } ${deletingId === conv.id ? 'deleting' : ''}`}
                            onClick={() => selectConversation(conv.id)}
                        >
                            <div className="conversation-content">
                                <div className="conversation-title">{conv.title}</div>
                                <div className="conversation-date">
                                    {formatDate(conv.updated_at)}
                                </div>
                            </div>
                            <button
                                className="btn-delete-conversation"
                                onClick={(e) => handleDeleteConversation(e, conv.id)}
                                disabled={deletingId === conv.id}
                                title="Deletar conversa"
                            >
                                {deletingId === conv.id ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                    <i className="fas fa-trash-alt"></i>
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ConversationSidebar;
