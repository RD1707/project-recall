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
  const { page = 1, search = '', sort = 'created_at' } = params;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Utilizador não autenticado');

    const query = new URLSearchParams({ page, limit: 20, search, sort }).toString();
    
    const response = await fetch(`/api/community/decks?${query}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar baralhos da comunidade');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, 'fetchPublicDecks');
  }
};

export const cloneDeck = async (deckId) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Utilizador não autenticado');

        const response = await fetch(`/api/community/decks/${deckId}/clone`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao clonar o baralho');
        }

        return await response.json();
    } catch (error) {
        return handleApiError(error, 'cloneDeck');
    }
};

export const rateDeck = async (deckId, rating) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Utilizador não autenticado');

    const response = await fetch(`/api/community/decks/${deckId}/rate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao submeter avaliação');
    }
    
    return await response.json();
  } catch (error) {
    // A função handleApiError já mostra um toast de erro
    return handleApiError(error, 'rateDeck');
  }
};

export const fetchSharedDeck = async (shareableId) => {
  try {
    const response = await fetch(`/api/shared/${shareableId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Baralho compartilhado não encontrado');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, 'fetchSharedDeck');
  }
};