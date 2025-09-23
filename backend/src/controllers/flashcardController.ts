import { Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../config/supabaseClient';
import { calculateSrsParameters } from '../services/srsService';
import { AuthUser } from '@/types';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const flashcardSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

const reviewSchema = z.object({
    quality: z.number().min(0).max(5), 
});


const isUserDeckOwner = async (userId: string, deckId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('decks')
        .select('id')
        .eq('user_id', userId)
        .eq('id', deckId)
        .single();
    return !error && !!data;
};

// Helper para verificar se o usuário é dono do card (através do deck)
const isUserCardOwner = async (userId: string, cardId: string): Promise<{owner: boolean, card: any}> => {
    const { data, error } = await supabase
        .from('cards')
        .select('*, decks(user_id)')
        .eq('id', cardId)
        .single();

    if (error || !data) {
        return { owner: false, card: null };
    }
    
    const cardData = data as any; // Cast para evitar erro de tipo
    return { owner: cardData.decks.user_id === userId, card: cardData };
}


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
        return res.status(201).json(data);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        console.error('Error creating flashcard:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

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
        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Error fetching flashcards:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getFlashcardById = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    try {
        const { owner, card } = await isUserCardOwner(userId, id);
        if (!owner) {
            return res.status(404).json({ message: 'Card not found or access denied' });
        }
        return res.status(200).json(card);
    } catch (error: any) {
        console.error('Error fetching flashcard by ID:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const updateFlashcard = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    
    try {
        const { owner } = await isUserCardOwner(userId, id);
        if (!owner) {
            return res.status(404).json({ message: 'Card not found or access denied' });
        }

        const { question, answer } = flashcardSchema.parse(req.body);

        const { data, error } = await supabase
            .from('cards')
            .update({ question, answer })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return res.status(200).json(data);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        console.error('Error updating flashcard:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteFlashcard = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    
    try {
        const { owner } = await isUserCardOwner(userId, id);
        if (!owner) {
            return res.status(404).json({ message: 'Card not found or access denied' });
        }

        const { error } = await supabase
            .from('cards')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting flashcard:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const reviewFlashcard = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id: cardId } = req.params;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    try {
        const { quality } = reviewSchema.parse(req.body);

        const { owner, card } = await isUserCardOwner(userId, cardId);
        if (!owner || !card) {
            return res.status(404).json({ message: 'Card not found or access denied' });
        }
        
        const srsParams = calculateSrsParameters({
            quality,
            repetitions: card.repetitions,
            easeFactor: card.ease_factor,
            interval: card.interval,
        });

        const { data: updatedCard, error: updateError } = await supabase
            .from('cards')
            .update({ 
                repetitions: srsParams.repetitions, 
                ease_factor: srsParams.ease_factor, 
                interval: srsParams.interval, 
                next_review: srsParams.next_review.toISOString() 
            })
            .eq('id', cardId)
            .select()
            .single();
        
        if (updateError) throw updateError;

        return res.status(200).json(updatedCard);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        console.error('Error reviewing flashcard:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};