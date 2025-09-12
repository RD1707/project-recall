import { supabase } from './supabaseClient';
import { handleError } from '../utils/errorHandler';

const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar conquistas');
        }

        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'fetchAchievements' });
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao recalcular conquistas');
        }

        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'recalculateAchievements' });
    }
};