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
    
    const { data, error } = await supabase
      .from('decks')
      .insert({ ...deckData, user_id: session.user.id })
      .select('*, flashcards(count)')
      .single();

    if (error) throw error;
    
    return { ...data, card_count: 0 };
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

export const shareDeck = async (deckId) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Usuário não autenticado');
    
    const response = await fetch(`/api/decks/${deckId}/share`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`
        }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Falha ao compartilhar o baralho.");
    
    const shareableLink = `${window.location.origin}/shared-deck/${data.shareableId}`;
    return { shareableLink };
    
  } catch (error) {
    return handleApiError(error, 'shareDeck');
  }
}

export const fetchSharedDeck = async (shareableId) => {
    try {
        const response = await fetch(`/api/shared/${shareableId}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Não foi possível encontrar o baralho.');
        }
        return data;
    } catch (error) {
        console.error(`Erro ao buscar baralho compartilhado:`, error);
        throw error;
    }
};