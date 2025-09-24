import toast from 'react-hot-toast';
import { supabase } from './supabaseClient';

const handleApiError = async (response) => {
    let errorData;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.indexOf("application/json") !== -1) {
        errorData = await response.json();
    } else {
        const text = await response.text();
        errorData = { error: `Ocorreu um erro no servidor (Status: ${response.status})`, details: text };
    }
    
    console.error("Erro da API:", errorData);
    
    if (errorData.field && errorData.type === 'FIELD_ERROR') {
        throw errorData; 
    }

    const errorMessage = errorData.error || errorData.message || 'Ocorreu um erro desconhecido.';
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