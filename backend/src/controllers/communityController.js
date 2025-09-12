const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');
const { z } = require('zod');

// Schema para validação de query parameters
const getPublicDecksSchema = z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    sort: z.enum(['created_at', 'title', 'rating']).default('created_at')
});

const getPublicDecks = async (req, res) => {
    try {
        // Validar e sanitizar parâmetros de entrada
        const { page, limit, search: searchTerm, sort: sortBy } = getPublicDecksSchema.parse(req.query);
        
        const from = (page - 1) * limit;
        const to = from + limit - 1;
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

        // Sanitizar e aplicar filtro de busca de forma segura
        if (searchTerm) {
            // Escapar caracteres especiais e usar textSearch para busca mais segura
            const sanitizedSearch = searchTerm.replace(/[%_\\]/g, '\\$&');
            query = query.or(`title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`);
        }

        query = query.order(sortBy, { ascending: false });

        const { data, error } = await query.range(from, to);

        if (error) {
            logger.error(`Database error in getPublicDecks: ${error.message}`, {
                query: req.query,
                error: error
            });
            throw new Error('Database query failed');
        }

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
        if (error instanceof z.ZodError) {
            logger.warn(`Validation error in getPublicDecks:`, {
                errors: error.errors,
                query: req.query
            });
            return res.status(400).json({ 
                message: 'Parâmetros inválidos.', 
                code: 'VALIDATION_ERROR',
                details: error.errors
            });
        }
        
        logger.error(`Error fetching public decks: ${error.message}`, {
            stack: error.stack,
            query: req.query
        });
        res.status(500).json({ message: 'Erro ao buscar os baralhos da comunidade.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

// Schema para validação de UUID
const uuidSchema = z.string().uuid('ID deve ser um UUID válido');

const cloneDeck = async (req, res) => {
    try {
        const deckId = uuidSchema.parse(req.params.deckId);
        const userId = req.user.id;

        // Verificar se o usuário já clonou este baralho recentemente (proteção contra spam)
        const { data: existingClones, error: cloneCheckError } = await supabase
            .from('decks')
            .select('id')
            .eq('user_id', userId)
            .ilike('title', `%${deckId}%`)
            .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutos

        if (cloneCheckError) {
            logger.error(`Error checking existing clones: ${cloneCheckError.message}`);
        } else if (existingClones && existingClones.length >= 3) {
            return res.status(429).json({ 
                message: 'Muitas tentativas de clonagem. Tente novamente em alguns minutos.', 
                code: 'RATE_LIMITED' 
            });
        }
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

        if (deckError) {
            logger.error(`Database error fetching deck for cloning: ${deckError.message}`, {
                deckId,
                userId,
                error: deckError
            });
            throw new Error('Failed to fetch deck for cloning');
        }
        
        if (!originalDeck || !originalDeck.is_shared) {
            logger.warn(`Attempt to clone non-existent or private deck`, {
                deckId,
                userId,
                found: !!originalDeck,
                isShared: originalDeck?.is_shared
            });
            return res.status(404).json({ message: 'Baralho público não encontrado.', code: 'NOT_FOUND' });
        }
        
        if (originalDeck.user_id === userId) {
            return res.status(400).json({ message: 'Você não pode clonar seu próprio baralho.', code: 'CLONE_SELF' });
        }

        // Validar que o deck não tem conteúdo malicioso ou muito grande
        if (originalDeck.flashcards && originalDeck.flashcards.length > 1000) {
            logger.warn(`Attempt to clone oversized deck`, {
                deckId,
                userId,
                cardCount: originalDeck.flashcards.length
            });
            return res.status(400).json({ 
                message: 'Este baralho é muito grande para ser clonado (máximo 1000 cards).', 
                code: 'DECK_TOO_LARGE' 
            });
        }

        // Sanitizar dados antes de criar o deck
        const sanitizeText = (text) => {
            if (!text) return text;
            return text.toString().trim().slice(0, 255); // Limitar tamanho
        };

        const newDeckData = {
            title: sanitizeText(`${originalDeck.title} (Cópia)`),
            description: sanitizeText(originalDeck.description),
            color: originalDeck.color,
            user_id: userId,
            is_shared: false,
        };
        
        const { data: newDeck, error: newDeckError } = await supabase
            .from('decks')
            .insert(newDeckData)
            .select()
            .single();
            
        if (newDeckError) {
            logger.error(`Error creating cloned deck: ${newDeckError.message}`, {
                deckId,
                userId,
                newDeckData,
                error: newDeckError
            });
            throw new Error('Failed to create cloned deck');
        }

        if (originalDeck.flashcards && originalDeck.flashcards.length > 0) {
            const sanitizeFlashcard = (card) => ({
                deck_id: newDeck.id,
                question: sanitizeText(card.question),
                answer: sanitizeText(card.answer),
                card_type: card.card_type || 'text',
                options: Array.isArray(card.options) ? card.options.slice(0, 6).map(opt => sanitizeText(opt)) : card.options,
                repetition: 0,
                interval: 1,
                ease_factor: 2.5,
                due_date: new Date().toISOString(),
            });

            const newFlashcardsData = originalDeck.flashcards.map(sanitizeFlashcard);

            const { error: newFlashcardsError } = await supabase
                .from('flashcards')
                .insert(newFlashcardsData);

            if (newFlashcardsError) {
                logger.error(`Error creating cloned flashcards: ${newFlashcardsError.message}`, {
                    deckId,
                    userId,
                    newDeckId: newDeck.id,
                    cardCount: newFlashcardsData.length,
                    error: newFlashcardsError
                });
                // Tentar limpar o deck criado em caso de erro
                await supabase.from('decks').delete().eq('id', newDeck.id);
                throw new Error('Failed to create cloned flashcards');
            }
        }

        logger.info(`Deck cloned successfully`, {
            originalDeckId: deckId,
            newDeckId: newDeck.id,
            userId,
            cardCount: originalDeck.flashcards?.length || 0
        });

        res.status(201).json({ message: 'Baralho clonado com sucesso!', deck: newDeck });

    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn(`Validation error in cloneDeck:`, {
                errors: error.errors,
                deckId: req.params.deckId,
                userId: req.user?.id
            });
            return res.status(400).json({ 
                message: 'ID do baralho inválido.', 
                code: 'VALIDATION_ERROR',
                details: error.errors
            });
        }

        logger.error(`Error cloning deck: ${error.message}`, {
            deckId: req.params.deckId,
            userId: req.user?.id,
            stack: error.stack
        });
        res.status(500).json({ message: 'Erro ao clonar o baralho.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const rateDeck = async (req, res) => {
    const ratingSchema = z.object({
        rating: z.number().int().min(1).max(5),
    });

    try {
        const deckId = uuidSchema.parse(req.params.deckId);
        const userId = req.user.id;
        const { rating } = ratingSchema.parse(req.body);

        // Verificar se o deck existe e é público
        const { data: deck, error: deckError } = await supabase
            .from('decks')
            .select('id, is_shared, user_id')
            .eq('id', deckId)
            .single();

        if (deckError || !deck) {
            return res.status(404).json({ message: 'Baralho não encontrado.', code: 'NOT_FOUND' });
        }

        if (!deck.is_shared) {
            return res.status(403).json({ message: 'Você não pode avaliar um baralho privado.', code: 'FORBIDDEN' });
        }

        if (deck.user_id === userId) {
            return res.status(400).json({ message: 'Você não pode avaliar seu próprio baralho.', code: 'SELF_RATING' });
        }

        // Verificar rate limiting (máximo 10 avaliações por hora)
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: recentRatings, error: ratingsError } = await supabase
            .from('deck_ratings')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', hourAgo);

        if (ratingsError) {
            logger.error(`Error checking rating limits: ${ratingsError.message}`);
        } else if (recentRatings && recentRatings.length >= 10) {
            return res.status(429).json({ 
                message: 'Muitas avaliações. Tente novamente em uma hora.', 
                code: 'RATE_LIMITED' 
            });
        }

        const { error } = await supabase
            .from('deck_ratings')
            .upsert(
                { 
                    deck_id: deckId, 
                    user_id: userId, 
                    rating: rating,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'deck_id, user_id' } 
            );

        if (error) {
            logger.error(`Database error in rateDeck: ${error.message}`, {
                deckId,
                userId,
                rating,
                error
            });
            throw new Error('Failed to save rating');
        }

        logger.info(`Deck rated successfully`, {
            deckId,
            userId,
            rating
        });

        res.status(201).json({ message: 'Avaliação registrada com sucesso!' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn(`Validation error in rateDeck:`, {
                errors: error.errors,
                deckId: req.params.deckId,
                userId: req.user?.id,
                body: req.body
            });
            return res.status(400).json({ 
                message: "Dados inválidos. A avaliação deve ser um número de 1 a 5.", 
                code: 'VALIDATION_ERROR',
                details: error.errors
            });
        }
        
        logger.error(`Error rating deck: ${error.message}`, {
            deckId: req.params.deckId,
            userId: req.user?.id,
            body: req.body,
            stack: error.stack
        });
        res.status(500).json({ message: 'Erro ao registrar a avaliação.', code: 'INTERNAL_SERVER_ERROR' });
    }
};


module.exports = {
    getPublicDecks,
    cloneDeck,
    rateDeck
};