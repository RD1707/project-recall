import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

const handleApiError = async (response, context) => {
    console.error(`Erro em ${context}:`, response);
    let errorMessage = `Ocorreu um erro em: ${context}.`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        errorMessage = response.statusText;
    }
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
            await handleApiError(response, 'createFlashcard');
        }
        const data = await response.json();
        return data.flashcard;
    } catch (error) {
        console.error("Falha ao criar flashcard:", error);
        throw error;
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
            await handleApiError(response, 'updateFlashcard');
        }
        const data = await response.json();
        return data.flashcard;
    } catch (error) {
        console.error("Falha ao atualizar flashcard:", error);
        throw error;
    }
}

export const deleteFlashcard = async (cardId) => {
    try {
        const response = await fetch(`/api/flashcards/${cardId}`, {
            method: 'DELETE',
            headers: { 'Authorization': await getAuthHeader() }
        });
        if (!response.ok) {
            await handleApiError(response, 'deleteFlashcard');
        }
        return true;
    } catch (error) {
        console.error("Falha ao deletar flashcard:", error);
        throw error;
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
            await handleApiError(response, 'generateFlashcardsFromText');
        }
        return await response.json();
    } catch (error) {
        throw error;
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
            await handleApiError(response, 'generateFlashcardsFromFile');
        }
        return await response.json();
    } catch (error) {
        throw error;
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
            await handleApiError(response, 'generateFlashcardsFromYouTube');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const fetchReviewCards = async (deckId) => {
    try {
        const response = await fetch(`/api/decks/${deckId}/review`, {
            headers: { 'Authorization': await getAuthHeader() }
        });
        if (!response.ok) {
            await handleApiError(response, 'fetchReviewCards');
        }
        return await response.json();
    } catch (error) {
        throw error;
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
            await handleApiError(response, 'submitReview');
        }
        return await response.json();
    } catch (error) {
        throw error;
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
            await handleApiError(response, 'getExplanation');
        }
        return await response.json();
    } catch (error) {
        throw error;
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
            await handleApiError(response, 'chatWithTutor');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};