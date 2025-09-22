import { Router } from 'express';
import * as deckController from '../controllers/deckController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', deckController.createDeck);
router.get('/', deckController.getUserDecks);
router.get('/:id', deckController.getDeckById);
router.put('/:id', deckController.updateDeck);
router.delete('/:id', deckController.deleteDeck);

router.post('/:id/generate-cards', deckController.generateCardsForDeck);

router.post('/:id/upload', deckController.uploadFileToDeck);

export default router;