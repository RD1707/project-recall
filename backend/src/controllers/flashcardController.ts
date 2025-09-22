import { Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../config/supabaseClient';
import { calculateSrsParameters } from '../services/srsService';

// Interface para requisições autenticadas
interface AuthenticatedRequest extends Request {
  user?: { id: string; [key: string]: any };
}

// Esquema de validação para criar um flashcard
const flashcardSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

// Esquema de validação para a resposta de uma revisão
const reviewSchema = z.object({
    quality: z.number().min(0).max(5), // Qualidade da resposta (0-5)
});


// Função para verificar se o usuário é dono do deck
const isUserDeckOwner = async (userId: string, deckId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('decks')
        .select('id')
        .eq('user_id', userId)
        .eq('id', deckId)
        .single();
    return !error && !!data;
};


// Criar um novo flashcard
export const createFlashcard = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { deckId } = req.params;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    try {
        if (!await isUserDeckOwner(userId, deckId)) {
            return res.status(403).json({ message: 'Access denied to this deck' });
        }

        const { question, answer } = flashcardSchema.parse(req.body);
        const { data, error } = await supabase
            .from('cards')
            .insert({ question, answer, deck_id: deckId })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        console.error('Error creating flashcard:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Obter todos os flashcards de um deck
export const getFlashcardsByDeck = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { deckId } = req.params;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    
    try {
        if (!await isUserDeckOwner(userId, deckId)) {
            return res.status(403).json({ message: 'Access denied to this deck' });
        }

        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('deck_id', deckId);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        console.error('Error fetching flashcards:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Obter um flashcard específico
export const getFlashcardById = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    try {
        // Query para buscar o card e verificar se ele pertence a um deck do usuário
        const { data, error } = await supabase
            .from('cards')
            .select('*, decks(user_id)')
            .eq('id', id)
            .single();

        if (error || !data || (data as any).decks.user_id !== userId) {
            return res.status(404).json({ message: 'Card not found or access denied' });
        }

        res.status(200).json(data);
    } catch (error: any) {
        console.error('Error fetching flashcard by ID:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Atualizar um flashcard
export const updateFlashcard = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    
    try {
        const { data: existingCard } = await getFlashcardById(req, res);
        if (!existingCard) return; // A resposta de erro já foi enviada por getFlashcardById

        const { question, answer } = flashcardSchema.parse(req.body);

        const { data, error } = await supabase
            .from('cards')
            .update({ question, answer })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        console.error('Error updating flashcard:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Deletar um flashcard
export const deleteFlashcard = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    
    try {
        const { data: existingCard } = await getFlashcardById(req, res);
        if (!existingCard) return;

        const { error } = await supabase
            .from('cards')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting flashcard:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Revisar um flashcard (lógica do SRS)
export const reviewFlashcard = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id: cardId } = req.params;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    try {
        const { quality } = reviewSchema.parse(req.body);

        const { data: card, error: cardError } = await supabase
            .from('cards')
            .select('*, decks(user_id)')
            .eq('id', cardId)
            .single();
        
        if (cardError || !card || (card as any).decks.user_id !== userId) {
            return res.status(404).json({ message: 'Card not found or access denied' });
        }
        
        const { repetitions, ease_factor, interval, next_review } = calculateSrsParameters({
            quality,
            repetitions: card.repetitions,
            easeFactor: card.ease_factor,
            interval: card.interval,
        });

        const { data: updatedCard, error: updateError } = await supabase
            .from('cards')
            .update({ repetitions, ease_factor, interval, next_review: new Date(next_review).toISOString() })
            .eq('id', cardId)
            .select()
            .single();
        
        if (updateError) throw updateError;

        res.status(200).json(updatedCard);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        console.error('Error reviewing flashcard:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};