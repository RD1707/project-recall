import { Router } from 'express';
import * as flashcardController from '../controllers/flashcardController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/decks/:deckId/cards', flashcardController.createFlashcard);

router.get('/decks/:deckId/cards', flashcardController.getFlashcardsByDeck);

router.get('/cards/:id', flashcardController.getFlashcardById);
router.put('/cards/:id', flashcardController.updateFlashcard);
router.delete('/cards/:id', flashcardController.deleteFlashcard);

router.post('/cards/:id/review', flashcardController.reviewFlashcard);

export default router;