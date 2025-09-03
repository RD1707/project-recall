import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

const handleApiError = (error, context) => {
  console.error(`Erro em ${context}:`, error);
  const errorMessage = error.message || `Ocorreu um erro em: ${context}.`;
  toast.error(errorMessage);
  throw new Error(errorMessage);
};

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
                'Authorization': `Bearer ${supabase.auth.getSession().data.session.access_token}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao gerar flashcards');
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
                'Authorization': `Bearer ${supabase.auth.getSession().data.session.access_token}`
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
                'Authorization': `Bearer ${supabase.auth.getSession().data.session.access_token}`
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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Utilizador não autenticado');

        const today = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('deck_id', deckId)
            .or(`due_date.lte.${today},due_date.is.null`)
            .limit(20); 

        if (error) throw error;
        return data;

    } catch (error) {
        return handleApiError(error, 'fetchReviewCards');
    }
};

export const submitReview = async (cardId, quality) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Utilizador não autenticado');
        
        const response = await fetch(`/api/flashcards/${cardId}/review`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
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