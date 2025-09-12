const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const flashcardController = require('../controllers/flashcardController'); 
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

router.post('/:id/generate', deckController.generateCardsForDeck);
router.post('/:id/generate-from-file', upload.single('file'), deckController.generateCardsFromFile);
router.post('/:id/generate-from-youtube', deckController.generateCardsFromYouTube);

router.get('/:id/review', deckController.getReviewCardsForDeck);
router.post('/:id/publish', deckController.publishDeck);

router.route('/:deckId/flashcards')
    .get(flashcardController.getFlashcardsInDeck)
    .post(flashcardController.createFlashcard);

module.exports = router;