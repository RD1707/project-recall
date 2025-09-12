import toast from 'react-hot-toast';
import { supabase } from './supabaseClient';
import { TIMEOUTS, MESSAGES } from '../constants';

/**
 * Manipula erros de API de forma consistente
 * @param {Response} response - Resposta da API
 * @returns {Promise<never>} - Sempre lança um erro
 */
const handleApiError = async (response) => {
    let errorData;
    const contentType = response.headers.get('content-type');

    try {
        if (contentType?.includes('application/json')) {
            errorData = await response.json();
        } else {
            const text = await response.text();
            errorData = { 
                error: `Erro no servidor (Status: ${response.status})`, 
                details: text 
            };
        }
    } catch (parseError) {
        errorData = { 
            error: 'Erro ao processar resposta do servidor',
            status: response.status 
        };
    }
    
    console.error('API Error:', { status: response.status, errorData });
    
    // Erros de campo específicos (para formulários)
    if (errorData.field && errorData.type === 'FIELD_ERROR') {
        throw errorData; 
    }

    const errorMessage = errorData.error || errorData.message || MESSAGES.ERROR.GENERIC;
    toast.error(errorMessage);
    throw new Error(errorMessage);
};

export const loginUser = async (credentials) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        const data = await response.json();
        
        if (data.session) {
            await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            });
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const completeUserProfile = async (profileData) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Usuário não autenticado");

        const response = await fetch('/api/auth/complete-google-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(profileData),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Falha ao completar o perfil.');
        }
        return data;
    } catch (error) {
        toast.error(error.message);
        throw error;
    }
};

export const requestPasswordReset = async (email) => {
    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async ({ accessToken, refreshToken, newPassword }) => {
    try {
        const body = { 
            access_token: accessToken, 
            password: newPassword 
        };
        
        // Só incluir refresh_token se não estiver vazio
        if (refreshToken && refreshToken.trim() !== '') {
            body.refresh_token = refreshToken;
        }

        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};