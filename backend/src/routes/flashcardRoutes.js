const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.authenticateToken);

// A rota base agora será /api/flashcards, então o caminho aqui é apenas /:cardId
router.route('/:cardId')
    .put(flashcardController.updateFlashcard)
    .delete(flashcardController.deleteFlashcard);

router.post('/:cardId/review', flashcardController.reviewFlashcard);
router.post('/:cardId/explain', flashcardController.getExplanation);

module.exports = router;