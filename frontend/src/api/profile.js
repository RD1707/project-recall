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
      .select('username, full_name, points, current_streak, bio, avatar_url, banner_url, has_completed_onboarding, interests')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { 
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      username: profile?.username || '',
      fullName: profile?.full_name || '',
      points: profile?.points || 0,
      current_streak: profile?.current_streak || 0,
      bio: profile?.bio || '',
      avatar_url: profile?.avatar_url || null,
      banner_url: profile?.banner_url || null,
      interests: profile?.interests || [],
      has_completed_onboarding: profile?.has_completed_onboarding || false,
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
        throw handleApiError(error, 'updateProfile');
    }
};

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

export const uploadBanner = async (file) => {
    try {
        const formData = new FormData();
        formData.append('banner', file);

        const response = await fetch('/api/profile/banner', {
            method: 'POST',
            headers: {
                'Authorization': await getAuthHeader(),
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao enviar o banner.');
        }
        return await response.json();
    } catch (error) {
       throw handleApiError(error, 'uploadBanner');
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

export const fetchLeaderboard = async (period = 'all_time') => {
    try {
        const response = await fetch(`/api/profile/leaderboard?period=${period}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao buscar o ranking.');
        }
        return await response.json();
    } catch (error) {
        throw handleApiError(error, 'fetchLeaderboard');
    }
};

export const markOnboardingAsComplete = async () => {
  try {
    const response = await fetch('/api/profile/onboarding-complete', {
      method: 'POST',
      headers: {
        'Authorization': await getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao marcar onboarding como completo.');
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao marcar onboarding como completo:", error);
    throw error;
  }
};

export const fetchPublicProfile = async (username) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Utilizador não autenticado");

    const response = await fetch(`/api/profile/public/${username}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar perfil público');
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, 'fetchPublicProfile');
  }
};

export const deleteAccount = async (password) => {
  try {
    const response = await fetch('/api/profile/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthHeader(),
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao excluir conta.');
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, 'deleteAccount');
  }
};