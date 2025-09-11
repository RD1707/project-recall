const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const getPublicDecks = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const searchTerm = req.query.search || '';
    const sortBy = req.query.sort || 'created_at'; 
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        let query = supabase
            .from('decks')
            .select(`
                id,
                title,
                description,
                color,
                created_at,
                user_id,
                flashcards(count),
                profiles (
                    username,
                    avatar_url
                )
            `, { count: 'exact' })
            .eq('is_shared', true);

        if (searchTerm) {
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        query = query.order(sortBy, { ascending: false });

        const { data, error } = await query.range(from, to);

        if (error) throw error;

        const decksWithCount = data.map(deck => {
            const { flashcards, profiles, ...deckData } = deck;
            return {
                ...deckData,
                card_count: flashcards[0]?.count || 0,
                author: profiles || { username: 'Anônimo', avatar_url: null }
            };
        });
        
        res.status(200).json(decksWithCount);

    } catch (error) {
        logger.error(`Error fetching public decks: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar os baralhos da comunidade.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const cloneDeck = async (req, res) => {
    const { deckId } = req.params;
    const userId = req.user.id;

    try {
        const { data: originalDeck, error: deckError } = await supabase
            .from('decks')
            .select(`
                title,
                description,
                color,
                is_shared,
                user_id,
                flashcards (
                    question,
                    answer,
                    card_type,
                    options
                )
            `)
            .eq('id', deckId)
            .single();

        if (deckError) throw deckError;
        
        if (!originalDeck || !originalDeck.is_shared) {
            return res.status(404).json({ message: 'Baralho público não encontrado.', code: 'NOT_FOUND' });
        }
        
        if(originalDeck.user_id === userId){
             return res.status(400).json({ message: 'Você não pode clonar seu próprio baralho.', code: 'CLONE_SELF' });
        }

        const newDeckData = {
            title: `${originalDeck.title} (Cópia)`,
            description: originalDeck.description,
            color: originalDeck.color,
            user_id: userId,
            is_shared: false,
        };
        
        const { data: newDeck, error: newDeckError } = await supabase
            .from('decks')
            .insert(newDeckData)
            .select()
            .single();
            
        if (newDeckError) throw newDeckError;

        if (originalDeck.flashcards && originalDeck.flashcards.length > 0) {
            const newFlashcardsData = originalDeck.flashcards.map(card => ({
                deck_id: newDeck.id,
                question: card.question,
                answer: card.answer,
                card_type: card.card_type,
                options: card.options,
                repetition: 0,
                interval: 1,
                ease_factor: 2.5,
                due_date: new Date().toISOString(),
            }));

            const { error: newFlashcardsError } = await supabase
                .from('flashcards')
                .insert(newFlashcardsData);

            if (newFlashcardsError) throw newFlashcardsError;
        }

        res.status(201).json({ message: 'Baralho clonado com sucesso!', deck: newDeck });

    } catch (error) {
        logger.error(`Error cloning deck ${deckId} for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao clonar o baralho.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const rateDeck = async (req, res) => {
    const { deckId } = req.params;
    const userId = req.user.id;

    const ratingSchema = z.object({
        rating: z.number().int().min(1).max(5),
    });

    try {
        const { rating } = ratingSchema.parse(req.body);

        const { error } = await supabase
            .from('deck_ratings')
            .upsert(
                { deck_id: deckId, user_id: userId, rating: rating },
                { onConflict: 'deck_id, user_id' } 
            );

        if (error) throw error;

        res.status(201).json({ message: 'Avaliação registrada com sucesso!' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "A avaliação deve ser um número de 1 a 5.", code: 'VALIDATION_ERROR' });
        }
        logger.error(`Error rating deck ${deckId} for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao registrar a avaliação.', code: 'INTERNAL_SERVER_ERROR' });
    }
};


module.exports = {
    getPublicDecks,
    cloneDeck,
    rateDeck
};