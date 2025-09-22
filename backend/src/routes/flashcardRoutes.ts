import { Router } from 'express';
import * as flashcardController from '../controllers/flashcardController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas de flashcards exigem autenticação
router.use(authMiddleware);

// Rota para criar um novo card em um deck específico
// O :deckId na URL é importante para associar o card ao deck correto
router.post('/decks/:deckId/cards', flashcardController.createFlashcard);

// Rota para buscar todos os cards de um deck específico
router.get('/decks/:deckId/cards', flashcardController.getFlashcardsByDeck);

// Rotas para um card específico
router.get('/cards/:id', flashcardController.getFlashcardById);
router.put('/cards/:id', flashcardController.updateFlashcard);
router.delete('/cards/:id', flashcardController.deleteFlashcard);

// Rota para registrar o resultado de uma sessão de estudo para um card
router.post('/cards/:id/review', flashcardController.reviewFlashcard);

export default router;