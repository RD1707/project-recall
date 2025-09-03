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
      window.location.href = '/login';
      throw new Error("Usuário não autenticado");
    }
    return `Bearer ${session.access_token}`;
}

export const createFlashcard = async (deckId, flashcardData) => {
    try {
        const { data, error } = await supabase
            .from('flashcards')
            .insert({ ...flashcardData, deck_id: deckId })
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        return handleApiError(error, 'createFlashcard');
    }
}

export const updateFlashcard = async (cardId, flashcardData) => {
    try {
        const { data, error } = await supabase
            .from('flashcards')
            .update(flashcardData)
            .eq('id', cardId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        return handleApiError(error, 'updateFlashcard');
    }
}

export const deleteFlashcard = async (cardId) => {
    try {
        const { error } = await supabase
            .from('flashcards')
            .delete()
            .eq('id', cardId);
        if (error) throw error;
        return true;
    } catch (error) {
        return handleApiError(error, 'deleteFlashcard');
    }
}

export const generateFlashcardsFromText = async (deckId, params) => {
    const body = {
        textContent: params.text,
        count: params.count,
        type: "Pergunta e Resposta", 
    };
    try {
        const response = await fetch(`/api/decks/${deckId}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader()
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao gerar flashcards a partir de texto');
        }
        return await response.json();
    } catch (error) {
        return handleApiError(error, 'generateFlashcardsFromText');
    }
};

export const generateFlashcardsFromFile = async (deckId, formData) => {
    try {
        const response = await fetch(`/api/decks/${deckId}/generate-from-file`, {
            method: 'POST',
            headers: {
                'Authorization': await getAuthHeader()
            },
            body: formData
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao gerar a partir do ficheiro');
        }
        return await response.json();
    } catch (error) {
        return handleApiError(error, 'generateFlashcardsFromFile');
    }
};

export const generateFlashcardsFromYouTube = async (deckId, params) => {
     const body = {
        youtubeUrl: params.url,
        count: params.count,
        type: "Pergunta e Resposta",
    };
    try {
         const response = await fetch(`/api/decks/${deckId}/generate-from-youtube`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader()
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao gerar do YouTube');
        }
        return await response.json();
    } catch (error) {
        return handleApiError(error, 'generateFlashcardsFromYouTube');
    }
};

export const fetchReviewCards = async (deckId) => {
    try {
        const response = await fetch(`/api/decks/${deckId}/review`, {
            headers: { 'Authorization': await getAuthHeader() }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao buscar cards para revisão');
        }
        return await response.json();
    } catch (error) {
        return handleApiError(error, 'fetchReviewCards');
    }
};

export const submitReview = async (cardId, quality) => {
    try {
        const response = await fetch(`/api/flashcards/${cardId}/review`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader()
            },
            body: JSON.stringify({ quality })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao submeter revisão');
        }
        
        return await response.json();

    } catch (error) {
        return handleApiError(error, 'submitReview');
    }
};