const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.authenticateToken);

router.get('/decks', communityController.getPublicDecks);
router.get('/decks/:deckId/view', communityController.getDeckForView);
router.get('/decks/:deckId/review', communityController.getReviewCardsForCommunityDeck);
router.post('/decks/:deckId/clone', communityController.cloneDeck);
router.post('/decks/:deckId/rate', communityController.rateDeck);

module.exports = router;