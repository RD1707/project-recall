import { supabase } from './supabaseClient';
import { handleError } from '../utils/errorHandler'; 
import { MESSAGES } from '../constants';

export const loginUser = async (credentials) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || MESSAGES.ERROR.GENERIC);
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