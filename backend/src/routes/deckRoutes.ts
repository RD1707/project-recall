import { Router } from 'express';
import * as deckController from '../controllers/deckController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas abaixo são protegidas e exigem que o usuário esteja logado.
router.use(authMiddleware);

// Rotas para Decks
router.post('/', deckController.createDeck);
router.get('/', deckController.getUserDecks);
router.get('/:id', deckController.getDeckById);
router.put('/:id', deckController.updateDeck);
router.delete('/:id', deckController.deleteDeck);

// Rota para gerar flashcards com IA para um deck específico
router.post('/:id/generate-cards', deckController.generateCardsForDeck);

// Rota para upload de arquivo para um deck
router.post('/:id/upload', deckController.uploadFileToDeck);

export default router;