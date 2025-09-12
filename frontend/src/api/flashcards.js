import { supabase } from './supabaseClient';
import { handleError } from '../utils/errorHandler'; 

const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Usuário não autenticado");
    }
    return `Bearer ${session.access_token}`;
}

export const createFlashcard = async (deckId, flashcardData) => {
    try {
        const response = await fetch(`/api/decks/${deckId}/flashcards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader()
            },
            body: JSON.stringify(flashcardData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar flashcard');
        }
        const data = await response.json();
        return data.flashcard;
    } catch (error) {
        throw handleError(error, { context: 'createFlashcard' });
    }
}

export const updateFlashcard = async (cardId, flashcardData) => {
    try {
        const response = await fetch(`/api/flashcards/${cardId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader()
            },
            body: JSON.stringify(flashcardData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar flashcard');
        }
        const data = await response.json();
        return data.flashcard;
    } catch (error) {
        throw handleError(error, { context: 'updateFlashcard' });
    }
}

export const deleteFlashcard = async (cardId) => {
    try {
        const response = await fetch(`/api/flashcards/${cardId}`, {
            method: 'DELETE',
            headers: { 'Authorization': await getAuthHeader() }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao deletar flashcard');
        }
        return true;
    } catch (error) {
        throw handleError(error, { context: 'deleteFlashcard' });
    }
}

export const generateFlashcardsFromText = async (deckId, params) => {
    try {
        const response = await fetch(`/api/decks/${deckId}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader()
            },
            body: JSON.stringify({
                textContent: params.textContent,
                count: params.count,
                type: params.type,
                difficulty: params.difficulty,
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao gerar flashcards a partir de texto');
        }
        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'generateFlashcardsFromText' });
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
            throw new Error(errorData.message || 'Erro ao gerar flashcards a partir de arquivo');
        }
        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'generateFlashcardsFromFile' });
    }
};

export const generateFlashcardsFromYouTube = async (deckId, params) => {
    try {
         const response = await fetch(`/api/decks/${deckId}/generate-from-youtube`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader()
            },
            body: JSON.stringify({
                youtubeUrl: params.youtubeUrl,
                count: params.count,
                type: params.type,
                difficulty: params.difficulty,
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao gerar flashcards do YouTube');
        }
        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'generateFlashcardsFromYouTube' });
    }
};

export const fetchReviewCards = async (deckId) => {
    try {
        const response = await fetch(`/api/decks/${deckId}/review`, {
            headers: { 'Authorization': await getAuthHeader() }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar cards para revisão');
        }
        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'fetchReviewCards' });
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
            throw new Error(errorData.message || 'Erro ao submeter revisão');
        }
        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'submitReview' });
    }
};

export const getExplanation = async (cardId) => {
    try {
        const response = await fetch(`/api/flashcards/${cardId}/explain`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader()
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao obter explicação');
        }
        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'getExplanation' });
    }
};

export const chatWithTutor = async (cardId, chatHistory) => {
    try {
        const response = await fetch(`/api/flashcards/${cardId}/chat`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader()
            },
            body: JSON.stringify({ chatHistory })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro na comunicação com o tutor');
        }
        return await response.json();
    } catch (error) {
        throw handleError(error, { context: 'chatWithTutor' });
    }
};