const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const getPublicDecks = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const searchTerm = req.query.search || '';
    const sortBy = req.query.sort || 'created_at';
    const filterType = req.query.filterType || '';
    const userId = req.user.id;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    logger.info(`[GET PUBLIC DECKS] Busca iniciada - userId: ${userId}, page: ${page}, filterType: '${filterType}', searchTerm: '${searchTerm}', sortBy: ${sortBy}`);

    try {
        let query = supabase
            .from('decks')
            .select(`
                id,
                title,
                description,
                color,
                created_at,
                published_at,
                user_id,
                flashcards(count),
                profiles (
                    username,
                    avatar_url
                )
            `, { count: 'exact' })
            .eq('is_shared', true);

        if (filterType === 'my_decks') {
            logger.info(`[GET PUBLIC DECKS] Aplicando filtro: apenas baralhos do usuário ${userId}`);
            query = query.eq('user_id', userId); 
        } else if (filterType === 'others') {
            logger.info(`[GET PUBLIC DECKS] Aplicando filtro: apenas baralhos de outros usuários (excluindo ${userId})`);
            query = query.neq('user_id', userId); 
        } else {
            logger.info(`[GET PUBLIC DECKS] Sem filtro de usuário: mostrando todos os baralhos públicos`);
        }

        if (searchTerm) {
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        switch (sortBy) {
            case 'created_at':
                logger.info(`[GET PUBLIC DECKS] Ordenando por data de publicação (published_at) ou criação (created_at)`);
                query = query.order('published_at', { ascending: false, nullsLast: true })
                            .order('created_at', { ascending: false }); 
                break;
            case 'created_at_asc':
                logger.info(`[GET PUBLIC DECKS] Ordenando por data de criação (mais antigos primeiro)`);
                query = query.order('created_at', { ascending: true });
                break;
            case 'engagement':
                logger.info(`[GET PUBLIC DECKS] Ordenação por engajamento será aplicada após cálculo do score`);
                break;
            default:
                logger.info(`[GET PUBLIC DECKS] Ordenação padrão: published_at/created_at descendente`);
                query = query.order('published_at', { ascending: false, nullsLast: true })
                            .order('created_at', { ascending: false }); 
                break;
        }

        const { data, error } = await query.range(from, to);

        if (error) {
            logger.error(`[GET PUBLIC DECKS] Erro na query principal: ${error.message}`);
            throw error;
        }

        logger.info(`[GET PUBLIC DECKS] Query executada com sucesso - ${data.length} baralhos encontrados na página ${page}`);

        if (data.length > 0) {
            const userDecks = data.filter(deck => deck.user_id === userId);
            const otherDecks = data.filter(deck => deck.user_id !== userId);
            logger.info(`[GET PUBLIC DECKS] Breakdown: ${userDecks.length} próprios, ${otherDecks.length} de outros usuários`);

            if (userDecks.length > 0) {
                logger.info(`[GET PUBLIC DECKS] Baralhos próprios encontrados: ${userDecks.map(d => `${d.id}(${d.title})`).join(', ')}`);
            }
        }

        const deckIds = data.map(deck => deck.id);
        let ratingsData = [];
        
        if (deckIds.length > 0) {
            const { data: ratings, error: ratingsError } = await supabase
                .from('deck_ratings')
                .select('deck_id, rating')
                .in('deck_id', deckIds);
                
            if (ratingsError) {
                logger.warn(`Error fetching ratings: ${ratingsError.message}`);
            } else {
                ratingsData = ratings || [];
            }
        }

        const ratingsMap = ratingsData.reduce((acc, rating) => {
            if (!acc[rating.deck_id]) {
                acc[rating.deck_id] = [];
            }
            acc[rating.deck_id].push(rating.rating);
            return acc;
        }, {});

        const decksWithCount = data.map(deck => {
            const { flashcards, profiles, ...deckData } = deck;
            const ratings = ratingsMap[deck.id] || [];
            const average_rating = ratings.length > 0
                ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
                : 0;
            const rating_count = ratings.length;

            let engagement_score = 0;
            if (rating_count > 0) {
                engagement_score = average_rating * Math.log(rating_count + 1) * rating_count;
                engagement_score = Math.round(engagement_score * 100) / 100;
            }

            return {
                ...deckData,
                card_count: flashcards[0]?.count || 0,
                author: profiles || { username: 'Anônimo', avatar_url: null },
                average_rating: Math.round(average_rating * 10) / 10, 
                rating_count,
                engagement_score 
            };
        });

        let finalDecks = decksWithCount;
        if (sortBy === 'engagement') {
            logger.info(`[GET PUBLIC DECKS] Aplicando ordenação por engagement score`);
            finalDecks = decksWithCount.sort((a, b) => {
                if (b.engagement_score !== a.engagement_score) {
                    return b.engagement_score - a.engagement_score;
                }
                const dateA = new Date(a.published_at || a.created_at);
                const dateB = new Date(b.published_at || b.created_at);
                return dateB - dateA;
            });

            if (finalDecks.length > 0) {
                const top3 = finalDecks.slice(0, 3);
                logger.info(`[GET PUBLIC DECKS] Top 3 por engajamento: ${top3.map(d =>
                    `${d.title} (score: ${d.engagement_score}, avg: ${d.average_rating}, votes: ${d.rating_count})`
                ).join(' | ')}`);
            }
        }

        res.status(200).json(finalDecks);

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

    try {
        const { rating } = req.body;

        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({ message: "A avaliação deve ser um número inteiro de 1 a 5.", code: 'VALIDATION_ERROR' });
        }

        // Verificar se já existe uma avaliação deste usuário para este deck
        const { data: existingRating, error: checkError } = await supabase
            .from('deck_ratings')
            .select('rating')
            .eq('deck_id', deckId)
            .eq('user_id', userId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        const isUpdate = !!existingRating;

        const { error } = await supabase
            .from('deck_ratings')
            .upsert(
                { deck_id: deckId, user_id: userId, rating: rating },
                { onConflict: 'deck_id, user_id' }
            );

        if (error) throw error;

        res.status(201).json({
            message: isUpdate ? 'Avaliação atualizada com sucesso!' : 'Avaliação registrada com sucesso!',
            isUpdate: isUpdate,
            previousRating: existingRating?.rating || null
        });

    } catch (error) {
        logger.error(`Error rating deck ${deckId} for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao registrar a avaliação.', code: 'INTERNAL_SERVER_ERROR' });
    }
};


const getDeckForView = async (req, res) => {
    const { deckId } = req.params;
    const userId = req.user.id;

    try {
        // Buscar o deck público
        const { data: deck, error: deckError } = await supabase
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
            `)
            .eq('id', deckId)
            .eq('is_shared', true)
            .single();

        if (deckError || !deck) {
            return res.status(404).json({ message: 'Baralho não encontrado ou não é público.', code: 'DECK_NOT_FOUND' });
        }

        // Buscar flashcards do deck
        const { data: flashcards, error: flashcardsError } = await supabase
            .from('flashcards')
            .select('id, question, answer, card_type, options')
            .eq('deck_id', deckId)
            .order('created_at', { ascending: true });

        if (flashcardsError) {
            logger.error(`Error fetching flashcards for deck ${deckId}: ${flashcardsError.message}`);
            throw flashcardsError;
        }

        // Buscar avaliações do deck
        const { data: ratings, error: ratingsError } = await supabase
            .from('deck_ratings')
            .select('rating')
            .eq('deck_id', deckId);

        if (ratingsError) {
            logger.warn(`Error fetching ratings for deck ${deckId}: ${ratingsError.message}`);
        }

        const ratingsData = ratings || [];
        const average_rating = ratingsData.length > 0
            ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
            : 0;

        const responseData = {
            id: deck.id,
            title: deck.title,
            description: deck.description,
            color: deck.color,
            created_at: deck.created_at,
            user_id: deck.user_id,
            card_count: deck.flashcards[0]?.count || 0,
            average_rating: Math.round(average_rating * 10) / 10,
            rating_count: ratingsData.length,
            author: deck.profiles || { username: 'Anônimo', avatar_url: null },
            flashcards: flashcards || []
        };

        res.status(200).json(responseData);

    } catch (error) {
        logger.error(`Error fetching deck ${deckId} for view: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar o baralho.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = {
    getPublicDecks,
    cloneDeck,
    rateDeck,
    getDeckForView
};