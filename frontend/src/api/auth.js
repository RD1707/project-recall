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
      throw new Error("Usuário não autenticado");
    }
    return `Bearer ${session.access_token}`;
};

export const completeUserProfile = async (profileData) => {
    try {
        const response = await fetch('/api/auth/complete-google-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader(),
            },
            body: JSON.stringify(profileData),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Falha ao completar o perfil.');
        }
        return data;
    } catch (error) {
        return handleApiError(error, 'completeUserProfile');
    }
};