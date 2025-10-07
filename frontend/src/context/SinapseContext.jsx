import React, { createContext, useContext, useState, useCallback } from 'react';
import * as sinapseAPI from '../api/sinapse';

const SinapseContext = createContext();

export const useSinapse = () => {
    const context = useContext(SinapseContext);
    if (!context) {
        throw new Error('useSinapse deve ser usado dentro de um SinapseProvider');
    }
    return context;
};

export const SinapseProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [loadingConversations, setLoadingConversations] = useState(false);

    // Carregar conversas
    const loadConversations = useCallback(async () => {
        setLoadingConversations(true);
        try {
            const data = await sinapseAPI.getConversations();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    // Criar nova conversa
    const createNewConversation = useCallback(async () => {
        try {
            const data = await sinapseAPI.createConversation();
            setConversations(prev => [data.conversation, ...prev]);
            setCurrentConversationId(data.conversation.id);
            setMessages([]);
            return data.conversation;
        } catch (error) {
            console.error('Erro ao criar conversa:', error);
            throw error;
        }
    }, []);

    // Selecionar conversa
    const selectConversation = useCallback(async (conversationId) => {
        if (conversationId === currentConversationId) return;

        setCurrentConversationId(conversationId);
        setIsLoading(true);
        try {
            const data = await sinapseAPI.getMessages(conversationId);
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentConversationId]);

    // Enviar mensagem
    const sendMessage = useCallback(async (content, attachments = []) => {
        if (!currentConversationId) {
            // Criar nova conversa se não houver uma selecionada
            const newConv = await createNewConversation();
            return sendMessageToConversation(newConv.id, content, attachments);
        }

        return sendMessageToConversation(currentConversationId, content, attachments);
    }, [currentConversationId]);

    const sendMessageToConversation = async (conversationId, content, attachments) => {
        setIsSending(true);
        try {
            const data = await sinapseAPI.sendMessage(conversationId, content, attachments);

            // Adicionar mensagens à lista
            setMessages(prev => [...prev, data.userMessage, data.assistantMessage]);

            // Atualizar título da conversa se foi alterado
            const updatedConvTitle = conversations.find(c => c.id === conversationId);
            if (updatedConvTitle && updatedConvTitle.title === 'Nova Conversa') {
                // Recarregar conversas para pegar o novo título
                loadConversations();
            }

            return data;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            throw error;
        } finally {
            setIsSending(false);
        }
    };

    // Deletar conversa
    const deleteConversation = useCallback(async (conversationId) => {
        try {
            await sinapseAPI.deleteConversation(conversationId);
            setConversations(prev => prev.filter(c => c.id !== conversationId));

            // Se era a conversa atual, limpar
            if (conversationId === currentConversationId) {
                setCurrentConversationId(null);
                setMessages([]);
            }
        } catch (error) {
            console.error('Erro ao deletar conversa:', error);
            throw error;
        }
    }, [currentConversationId]);

    // Upload de arquivo
    const uploadFile = useCallback(async (file) => {
        try {
            const data = await sinapseAPI.uploadFile(file);
            return data.attachment;
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            throw error;
        }
    }, []);

    const value = {
        // Estado
        conversations,
        currentConversationId,
        messages,
        isLoading,
        isSending,
        loadingConversations,

        // Ações
        loadConversations,
        createNewConversation,
        selectConversation,
        sendMessage,
        deleteConversation,
        uploadFile,
    };

    return (
        <SinapseContext.Provider value={value}>
            {children}
        </SinapseContext.Provider>
    );
};
