const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middleware/authMiddleware');

// Rate limiting para rotas da comunidade
const communityLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP por janela
    message: {
        message: 'Muitas solicitações. Tente novamente em 15 minutos.',
        code: 'RATE_LIMITED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const cloneLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // máximo 10 clones por IP por hora
    message: {
        message: 'Muitas tentativas de clonagem. Tente novamente em uma hora.',
        code: 'CLONE_RATE_LIMITED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const rateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // máximo 20 avaliações por IP por hora
    message: {
        message: 'Muitas avaliações. Tente novamente em uma hora.',
        code: 'RATING_RATE_LIMITED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(authMiddleware.authenticateToken);
router.use(communityLimiter);

router.get('/decks', communityController.getPublicDecks);
router.post('/decks/:deckId/clone', cloneLimiter, communityController.cloneDeck);
router.post('/decks/:deckId/rate', rateLimiter, communityController.rateDeck);

module.exports = router;