import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

const handleApiError = (error, context) => {
  console.error(`Erro em ${context}:`, error);
  toast.error(error.message || `Ocorreu um erro em: ${context}.`);
  throw error;
};

export const fetchDecks = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('decks')
      .select('*, flashcards(count)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(deck => ({
      ...deck,
      card_count: deck.flashcards[0]?.count || 0,
    }));
  } catch (error) {
    return handleApiError(error, 'fetchDecks');
  }
};

export const createDeck = async (deckData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Utilizador não autenticado');
    
    // Usar API do backend para que as conquistas sejam atualizadas
    const response = await fetch('/api/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(deckData)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao criar deck');
    
    return { ...data.deck, card_count: 0 };
  } catch (error) {
    return handleApiError(error, 'createDeck');
  }
};

export const updateDeck = async (deckId, deckData) => {
  try {
    const { data, error } = await supabase
      .from('decks')
      .update(deckData)
      .eq('id', deckId)
      .select('*, flashcards(count)')
      .single();

    if (error) throw error;

    return { ...data, card_count: data.flashcards[0]?.count || 0 };
  } catch (error) {
    return handleApiError(error, 'updateDeck');
  }
};

export const deleteDeck = async (deckId) => {
  try {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);

    if (error) throw error;
    
    return true; 
  } catch (error) {
    return handleApiError(error, 'deleteDeck');
  }
};

export const fetchDeckById = async (deckId) => {
  try {
    const { data, error } = await supabase
      .from('decks')
      .select('*, flashcards(count)')
      .eq('id', deckId)
      .single(); 

    if (error) throw error;

    return { ...data, card_count: data.flashcards[0]?.count || 0 };
  } catch (error) {
    return handleApiError(error, 'fetchDeckById');
  }
};

export const fetchFlashcardsByDeckId = async (deckId) => {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    return handleApiError(error, 'fetchFlashcardsByDeckId');
  }
};

export const publishDeck = async (deckId, is_shared) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Utilizador não autenticado');
    
    const response = await fetch(`/api/decks/${deckId}/publish`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_shared })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Falha ao atualizar o status do baralho.");
    
    return data;
    
  } catch (error) {
    return handleApiError(error, 'publishDeck');
  }
}

export const fetchPublicDecks = async (params = {}) => {
  // Validar e sanitizar parâmetros de entrada
  const page = Math.max(1, Math.min(1000, parseInt(params.page) || 1));
  const limit = Math.max(1, Math.min(100, parseInt(params.limit) || 20));
  const search = (params.search || '').toString().trim().slice(0, 100);
  const sort = ['created_at', 'title', 'rating'].includes(params.sort) ? params.sort : 'created_at';

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Utilizador não autenticado');

    const query = new URLSearchParams({ page, limit, search, sort }).toString();
    
    const response = await fetch(`/api/community/decks?${query}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        
        // Tratar diferentes tipos de erro
        switch (response.status) {
          case 400:
            throw new Error(errorData.message || 'Parâmetros inválidos');
          case 401:
            throw new Error('Sessão expirada. Faça login novamente.');
          case 403:
            throw new Error('Acesso negado');
          case 429:
            throw new Error('Muitas solicitações. Tente novamente em alguns minutos.');
          case 500:
            throw new Error('Erro interno do servidor');
          default:
            throw new Error(errorData.message || 'Erro ao buscar baralhos da comunidade');
        }
    }
    
    const data = await response.json();
    
    // Validar resposta
    if (!Array.isArray(data)) {
      throw new Error('Formato de resposta inválido');
    }

    return data;
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('Tempo limite esgotado. Verifique sua conexão.');
    }
    return handleApiError(error, 'fetchPublicDecks');
  }
};

export const cloneDeck = async (deckId) => {
    try {
        // Validar deckId
        if (!deckId || typeof deckId !== 'string') {
            throw new Error('ID do baralho é obrigatório');
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Utilizador não autenticado');

        const response = await fetch(`/api/community/decks/${deckId}/clone`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(15000) // Timeout de 15 segundos para clonagem
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
            
            switch (response.status) {
                case 400:
                    if (errorData.code === 'CLONE_SELF') {
                        throw new Error('Você não pode clonar seu próprio baralho');
                    }
                    if (errorData.code === 'DECK_TOO_LARGE') {
                        throw new Error('Este baralho é muito grande para ser clonado');
                    }
                    throw new Error(errorData.message || 'Dados inválidos');
                case 401:
                    throw new Error('Sessão expirada. Faça login novamente.');
                case 404:
                    throw new Error('Baralho não encontrado ou não é público');
                case 429:
                    throw new Error('Muitas tentativas de clonagem. Tente novamente mais tarde.');
                case 500:
                    throw new Error('Erro interno do servidor');
                default:
                    throw new Error(errorData.message || 'Erro ao clonar o baralho');
            }
        }

        const data = await response.json();
        
        // Validar resposta
        if (!data.message) {
            throw new Error('Resposta inválida do servidor');
        }

        return data;
    } catch (error) {
        if (error.name === 'TimeoutError') {
            throw new Error('Tempo limite esgotado. A clonagem pode demorar mais tempo.');
        }
        return handleApiError(error, 'cloneDeck');
    }
};

export const rateDeck = async (deckId, rating) => {
  try {
    // Validar parâmetros
    if (!deckId || typeof deckId !== 'string') {
      throw new Error('ID do baralho é obrigatório');
    }
    
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Avaliação deve ser um número inteiro entre 1 e 5');
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Utilizador não autenticado');

    const response = await fetch(`/api/community/decks/${deckId}/rate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating }),
      signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        
        switch (response.status) {
            case 400:
                if (errorData.code === 'SELF_RATING') {
                    throw new Error('Você não pode avaliar seu próprio baralho');
                }
                throw new Error(errorData.message || 'Dados de avaliação inválidos');
            case 401:
                throw new Error('Sessão expirada. Faça login novamente.');
            case 403:
                throw new Error('Você não pode avaliar este baralho');
            case 404:
                throw new Error('Baralho não encontrado');
            case 429:
                throw new Error('Muitas avaliações. Tente novamente em uma hora.');
            case 500:
                throw new Error('Erro interno do servidor');
            default:
                throw new Error(errorData.message || 'Erro ao submeter avaliação');
        }
    }
    
    const data = await response.json();
    
    // Validar resposta
    if (!data.message) {
      throw new Error('Resposta inválida do servidor');
    }

    return data;
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('Tempo limite esgotado. Tente novamente.');
    }
    return handleApiError(error, 'rateDeck');
  }
};

export const fetchSharedDeck = async (shareableId) => {
  try {
    // Validar shareableId
    if (!shareableId || typeof shareableId !== 'string') {
      throw new Error('ID compartilhável é obrigatório');
    }

    // Validar formato do ID (deve ser alfanumérico)
    if (!/^[a-zA-Z0-9_-]+$/.test(shareableId)) {
      throw new Error('ID compartilhável inválido');
    }

    const response = await fetch(`/api/shared/${encodeURIComponent(shareableId)}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      
      switch (response.status) {
        case 400:
          throw new Error('ID compartilhável inválido');
        case 404:
          throw new Error('Baralho compartilhado não encontrado ou acesso foi revogado');
        case 429:
          throw new Error('Muitas solicitações. Tente novamente em alguns minutos.');
        case 500:
          throw new Error('Erro interno do servidor');
        default:
          throw new Error(errorData.message || 'Erro ao carregar baralho compartilhado');
      }
    }
    
    const data = await response.json();

    // Validar estrutura da resposta
    if (!data.title || !Array.isArray(data.flashcards)) {
      throw new Error('Formato de dados inválido');
    }

    return data;
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('Tempo limite esgotado. Verifique sua conexão.');
    }
    return handleApiError(error, 'fetchSharedDeck');
  }
};