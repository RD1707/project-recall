import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

const handleApiError = async (response, context) => {
    console.error(`Erro em ${context}:`, response);
    let errorMessage = `Ocorreu um erro em: ${context}.`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        errorMessage = response.statusText || errorMessage;
    }
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

export const fetchAchievements = async () => {
    try {
        const response = await fetch('/api/achievements', {
            headers: {
                'Authorization': await getAuthHeader()
            }
        });

        if (!response.ok) {
            await handleApiError(response, 'fetchAchievements');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const recalculateAchievements = async () => {
    try {
        const response = await fetch('/api/achievements/recalculate', {
            method: 'POST',
            headers: {
                'Authorization': await getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            await handleApiError(response, 'recalculateAchievements');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};