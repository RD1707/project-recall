const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');
const { z } = require('zod');

// Schema para validação de shareable ID (deve ser alfanumérico)
const shareableIdSchema = z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'ID compartilhável deve conter apenas caracteres alfanuméricos')
    .min(1)
    .max(50);

const getSharedDeck = async (req, res) => {
    try {
        const shareableId = shareableIdSchema.parse(req.params.shareableId);

        // Rate limiting simples baseado no IP
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        logger.info(`Shared deck access attempt`, {
            shareableId,
            clientIP,
            userAgent: req.get('User-Agent')
        });
        const { data: deck, error: deckError } = await supabase
            .from('decks')
            .select('id, title, description, user_id') 
            .eq('shareable_id', shareableId)
            .eq('is_shared', true)
            .single();

        if (deckError) {
            logger.error(`Database error fetching shared deck: ${deckError.message}`, {
                shareableId,
                clientIP,
                error: deckError
            });
            return res.status(404).json({ message: 'Baralho compartilhado não encontrado ou o acesso foi revogado.', code: 'NOT_FOUND' });
        }

        if (!deck) {
            logger.warn(`Shared deck not found`, {
                shareableId,
                clientIP
            });
            return res.status(404).json({ message: 'Baralho compartilhado não encontrado ou o acesso foi revogado.', code: 'NOT_FOUND' });
        }

        const { data: flashcards, error: flashcardsError } = await supabase
            .from('flashcards')
            .select('question, answer, card_type, options')
            .eq('deck_id', deck.id) 
            .order('created_at', { ascending: true })
            .limit(1000); // Limitar a 1000 cards para evitar payloads muito grandes

        if (flashcardsError) {
            logger.error(`Database error fetching flashcards: ${flashcardsError.message}`, {
                shareableId,
                deckId: deck.id,
                clientIP,
                error: flashcardsError
            });
            throw new Error('Failed to fetch flashcards');
        }

        // Sanitizar dados antes de enviar
        const sanitizeText = (text) => {
            if (!text) return text;
            return text.toString().trim();
        };

        const sanitizedFlashcards = flashcards.map(card => ({
            question: sanitizeText(card.question),
            answer: sanitizeText(card.answer),
            card_type: card.card_type || 'text',
            options: Array.isArray(card.options) ? card.options.map(opt => sanitizeText(opt)) : card.options
        }));

        const responsePayload = {
            title: sanitizeText(deck.title),
            description: sanitizeText(deck.description),
            flashcards: sanitizedFlashcards,
            card_count: sanitizedFlashcards.length
        };

        logger.info(`Shared deck accessed successfully`, {
            shareableId,
            deckId: deck.id,
            userId: deck.user_id,
            cardCount: sanitizedFlashcards.length,
            clientIP
        });

        res.status(200).json(responsePayload);

    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn(`Validation error in getSharedDeck:`, {
                errors: error.errors,
                shareableId: req.params.shareableId
            });
            return res.status(400).json({ 
                message: 'ID compartilhável inválido.', 
                code: 'VALIDATION_ERROR',
                details: error.errors
            });
        }

        logger.error(`Error fetching shared deck: ${error.message}`, {
            shareableId: req.params.shareableId,
            stack: error.stack
        });
        res.status(500).json({ message: 'Erro interno ao obter o baralho.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = { getSharedDeck };