const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { getSharedDeck } = require('../controllers/shareController');

// Rate limiting para compartilhamentos (mais permissivo por ser público)
const shareLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200, // máximo 200 requests por IP por janela
    message: {
        message: 'Muitas solicitações. Tente novamente em 15 minutos.',
        code: 'RATE_LIMITED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for authenticated users with lower usage
    skip: (req) => {
        const userAgent = req.get('User-Agent') || '';
        // Skip para user agents conhecidos/confiáveis se necessário
        return false;
    }
});

router.get('/shared/:shareableId', shareLimiter, getSharedDeck);

module.exports = router;