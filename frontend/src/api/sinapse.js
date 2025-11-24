import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

const handleApiError = (error, context) => {
    console.error(`Erro em ${context}:`, error);
    const errorMessage = error.message || `Ocorreu um erro em: ${context}.`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
};

const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        toast.error("Sessão inválida. Por favor, faça login novamente.");
        throw new Error("Usuário não autenticado");
    }
    return `Bearer ${session.access_token}`;
};

export const createConversation = async () => {
    try {
        const response = await fetch('/api/sinapse/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader(),
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar conversa.');
        }

        return await response.json();
    } catch (error) {
        throw handleApiError(error, 'createConversation');
    }
};

export const getConversations = async () => {
    try {
        const response = await fetch('/api/sinapse/conversations', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader(),
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao buscar conversas.');
        }

        return await response.json();
    } catch (error) {
        throw handleApiError(error, 'getConversations');
    }
};

export const getMessages = async (conversationId) => {
    try {
        const response = await fetch(`/api/sinapse/conversations/${conversationId}/messages`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader(),
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao buscar mensagens.');
        }

        return await response.json();
    } catch (error) {
        throw handleApiError(error, 'getMessages');
    }
};

export const sendMessage = async (conversationId, content, attachments = []) => {
    try {
        const response = await fetch(`/api/sinapse/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader(),
            },
            body: JSON.stringify({ content, attachments }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao enviar mensagem.');
        }

        return await response.json();
    } catch (error) {
        throw handleApiError(error, 'sendMessage');
    }
};

export const deleteConversation = async (conversationId) => {
    try {
        const response = await fetch(`/api/sinapse/conversations/${conversationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader(),
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao deletar conversa.');
        }

        return await response.json();
    } catch (error) {
        throw handleApiError(error, 'deleteConversation');
    }
};

export const uploadFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/sinapse/upload', {
            method: 'POST',
            headers: {
                'Authorization': await getAuthHeader(),
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao fazer upload do arquivo.');
        }

        return await response.json();
    } catch (error) {
        throw handleApiError(error, 'uploadFile');
    }
};
