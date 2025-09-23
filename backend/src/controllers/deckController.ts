import { Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../config/supabaseClient';
import { generateFlashcardsFromText } from '../services/cohereService';
import { processFile } from '../services/fileProcessingService';
import multer from 'multer';
import { AuthUser } from '@/types';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const upload = multer({ storage: multer.memoryStorage() });

const createDeckSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  is_public: z.boolean().optional(),
  category: z.string().optional(),
});

const updateDeckSchema = createDeckSchema.partial(); 

export const createDeck = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'User not authenticated' });

  try {
    const { title, description, is_public, category } = createDeckSchema.parse(req.body);
    const { data, error } = await supabase
      .from('decks')
      .insert({ title, description, user_id: userId, is_public, category })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error creating deck:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserDecks = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'User not authenticated' });

  try {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching user decks:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDeckById = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const { data, error } = await supabase
            .from('decks')
            .select('*, cards(*)')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Not found
                return res.status(404).json({ message: 'Deck not found or access denied' });
            }
            throw error;
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Error fetching deck by ID:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateDeck = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const validatedData = updateDeckSchema.parse(req.body);
        
        const { data, error } = await supabase
            .from('decks')
            .update(validatedData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ message: 'Deck not found or access denied' });
            }
            throw error;
        }
        
        return res.status(200).json(data);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        console.error('Error updating deck:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteDeck = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        // First, check if the deck exists and belongs to the user
        const { error: selectError } = await supabase
            .from('decks')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        
        if (selectError) {
             return res.status(404).json({ message: 'Deck not found or access denied' });
        }
        
        const { error: deleteError } = await supabase
            .from('decks')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (deleteError) throw deleteError;
        
        return res.status(204).send(); 
    } catch (error: any) {
        console.error('Error deleting deck:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const generateCardsForDeck = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id: deckId } = req.params;
    const { topic, numCards, language } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!topic || !numCards) {
        return res.status(400).json({ message: 'Topic and number of cards are required.' });
    }

    try {
        const { data: deck, error: deckError } = await supabase
            .from('decks')
            .select('id')
            .eq('id', deckId)
            .eq('user_id', userId)
            .single();

        if (deckError || !deck) {
            return res.status(404).json({ message: 'Deck not found or access denied.' });
        }

        const cards = await generateFlashcardsFromText(topic, numCards, language);
        
        const cardsToInsert = cards.map((card: { question: string, answer: string }) => ({ ...card, deck_id: deckId }));

        const { data: insertedCards, error: insertError } = await supabase
            .from('cards')
            .insert(cardsToInsert)
            .select();

        if (insertError) throw insertError;

        return res.status(201).json(insertedCards);
    } catch (error: any) {
        console.error('Error generating AI cards:', error.message);
        return res.status(500).json({ message: 'Failed to generate flashcards.' });
    }
};

export const uploadFileToDeck = async (req: AuthenticatedRequest, res: Response) => {
    upload.single('file')(req, res, async (err: any) => {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        
        const userId = req.user?.id;
        const { id: deckId } = req.params;
        
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        try {
            const content = await processFile(req.file.path, req.file.mimetype as any);
            const cards = await generateFlashcardsFromText(content, 10, 'default');
            const cardsToInsert = cards.map((card: { question: string, answer: string }) => ({ ...card, deck_id: deckId }));
            const { data, error } = await supabase.from('cards').insert(cardsToInsert).select();
            
            if (error) throw error;
            
            return res.status(201).json({ message: 'File processed and cards created successfully', cards: data });

        } catch (error: any) {
            console.error('Error processing file:', error.message);
            return res.status(500).json({ message: 'Error processing file' });
        }
    });
};