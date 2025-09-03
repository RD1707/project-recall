// src/api/profile.js
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

const handleApiError = (error, context) => {
  console.error(`Erro em ${context}:`, error);
  toast.error(error.message || `Ocorreu um erro em: ${context}.`);
  return null;
};

export const fetchProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, full_name, points, current_streak')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { 
      throw error;
    }

    return {
      email: user.email,
      ...profile
    };

  } catch (error) {
    return handleApiError(error, 'fetchProfile');
  }
};

export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        return handleApiError(error, 'logout');
    }
    return true;
};