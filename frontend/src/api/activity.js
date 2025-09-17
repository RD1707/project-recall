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

export const fetchRecentActivity = async (limit = 10) => {
    try {
        const response = await fetch(`/api/profile/recent-activity?limit=${limit}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader(),
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao buscar atividade recente.');
        }
        return await response.json();
    } catch (error) {
        throw handleApiError(error, 'fetchRecentActivity');
    }
};