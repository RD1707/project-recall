// frontend/src/api/profile.js
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

export const fetchProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, full_name, points, current_streak, bio, avatar_url') // ← Adicionado avatar_url
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { 
      throw error;
    }

    return {
      email: user.email,
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      points: profile?.points || 0,
      current_streak: profile?.current_streak || 0,
      bio: profile?.bio || '',
      avatar_url: profile?.avatar_url || null, // ← Adicionado avatar_url
    };

  } catch (error) {
    return handleApiError(error, 'fetchProfile');
  }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader(),
            },
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao atualizar o perfil.');
        }
        return await response.json();
    } catch (error) {
        // Erro já será um objeto Error, então podemos apenas relançá-lo
        throw handleApiError(error, 'updateProfile');
    }
};

// FUNÇÃO IMPLEMENTADA para upload do avatar
export const uploadAvatar = async (file) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch('/api/profile/avatar', {
            method: 'POST',
            headers: {
                'Authorization': await getAuthHeader(),
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao enviar o avatar.');
        }
        return await response.json();
    } catch (error) {
       throw handleApiError(error, 'uploadAvatar');
    }
};


export const logout = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
        return true;
    } catch (error) {
        return handleApiError(error, 'logout');
    }
};