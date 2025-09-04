const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const flashcardController = require('../controllers/flashcardController'); // Importe o controller de flashcards
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, 
});

router.use(authMiddleware.authenticateToken);

router.get('/', deckController.getDecks);          
router.post('/', deckController.createDeck);        
router.put('/:id', deckController.updateDeck);      
router.delete('/:id', deckController.deleteDeck);  

// Rotas de geração de cards
router.post('/:id/generate', deckController.generateCardsForDeck);
router.post('/:id/generate-from-file', upload.single('file'), deckController.generateCardsFromFile);
router.post('/:id/generate-from-youtube', deckController.generateCardsFromYouTube);

// Rotas de estudo e compartilhamento
router.get('/:id/review', deckController.getReviewCardsForDeck);
router.post('/:id/share', deckController.shareDeck);

// ADICIONADO: Rotas para flashcards pertencentes a este deck
router.route('/:deckId/flashcards')
    .get(flashcardController.getFlashcardsInDeck)
    .post(flashcardController.createFlashcard);

module.exports = router;