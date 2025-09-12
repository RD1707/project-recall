import { supabase } from './supabaseClient';
import { handleError } from '../utils/errorHandler'; 
import { MESSAGES } from '../constants';

export const loginUser = async (credentials) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });
        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('E-mail ou senha inválidos.');
            }
            throw error;
        }

        return data;
    } catch (error) {
        throw handleError(error, { context: 'loginUser' });
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
            const errorData = await response.json();
            if (errorData.field) {
                throw errorData;
            }
            throw new Error(errorData.error || MESSAGES.ERROR.GENERIC);
        }

        return await response.json();
    } catch (error) {
        if (error.field) {
            throw error; 
        }
        throw handleError(error, { context: 'registerUser' });
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
            if (data.field) {
                throw { ...data, message: data.error };
            }
            throw new Error(data.error || 'Falha ao completar o perfil.');
        }
        return data;
    } catch (error) {
        if (error.field) {
            throw error; 
        }
        throw handleError(error, { context: 'completeUserProfile' });
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
            const errorData = await response.json();
            throw new Error(errorData.error || MESSAGES.ERROR.GENERIC);
        }

        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'requestPasswordReset' });
    }
};

export const resetPassword = async ({ accessToken, refreshToken, newPassword }) => {
    try {
        const body = { 
            access_token: accessToken, 
            password: newPassword 
        };
        
        if (refreshToken && refreshToken.trim() !== '') {
            body.refresh_token = refreshToken;
        }

        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || MESSAGES.ERROR.GENERIC);
        }

        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'resetPassword' });
    }
};