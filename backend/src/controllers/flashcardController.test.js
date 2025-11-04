// backend/src/controllers/flashcardController.test.js

const flashcardController = require('./flashcardController');
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');
const srsService = require('../services/srsService');
const cohereService = require('../services/cohereService');
const achievementService = require('../services/achievementService');

jest.mock('../config/supabaseClient');
jest.mock('../config/logger');
jest.mock('../services/srsService', () => ({
  calculateSm2: jest.fn(),
}));
jest.mock('../services/cohereService', () => ({
  getExplanationForFlashcard: jest.fn(),
  getChatResponse: jest.fn(),
}));
jest.mock('../services/achievementService', () => ({
  updateAchievementProgress: jest.fn(),
}));
jest.mock('../config/queue');

const mockRequest = (body = {}, params = {}, user = null) => ({
  body,
  params,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Flashcard Controller', () => {

  beforeEach(() => {
    supabase.__resetMocks();
    srsService.calculateSm2.mockClear();
    cohereService.getExplanationForFlashcard.mockClear();
  });

  describe('createFlashcard', () => {
    // Estes testes já estavam passando
    it('deve criar um flashcard com sucesso', async () => {
      const req = mockRequest({ question: 'Q1', answer: 'A1' }, { deckId: 'deck-1' }, { id: 'user-123' });
      const res = mockResponse();
      
      supabase.single.mockImplementationOnce(() => ({ data: { id: 'deck-1' }, error: null })); // checkDeckOwnership
      supabase.__setMockData({ id: 'card-1', question: 'Q1', answer: 'A1' }); // Mock do insert
      supabase.__setMockCount(5); // Mock do count

      await flashcardController.createFlashcard(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar 404 se o baralho não pertencer ao usuário', async () => {
      const req = mockRequest({ question: 'Q1', answer: 'A1' }, { deckId: 'deck-2' }, { id: 'user-123' });
      const res = mockResponse();
      supabase.single.mockImplementationOnce(() => ({ data: null, error: { code: 'PGRST116' } })); // checkDeckOwnership

      await flashcardController.createFlashcard(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve retornar 400 se a pergunta estiver faltando (validação Zod)', async () => {
      const req = mockRequest({ answer: 'A1' }, { deckId: 'deck-1' }, { id: 'user-123' });
      const res = mockResponse();
      await flashcardController.createFlashcard(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringMatching(/A pergunta é obrigatória.|Required/),
      }));
    });
  });

  describe('reviewFlashcard', () => {
    
    it('deve revisar um card com sucesso (quality >= 3) e atualizar pontos/achievements', async () => {
      const mockUser = { id: 'user-123' };
      const mockCardId = 'card-1';
      const mockDeckId = 'deck-1';
      const req = mockRequest({ quality: 3 }, { cardId: mockCardId }, mockUser);
      const res = mockResponse();

      const mockCurrentCard = {
        id: mockCardId,
        deck_id: mockDeckId,
        repetition: 0,
        ease_factor: 2.5,
        interval: 1,
        decks: { id: mockDeckId, user_id: 'user-123' } 
      };
      const mockSrsData = { repetition: 1, ease_factor: 2.5, interval: 6 };
      const mockUpdatedCard = { ...mockCurrentCard, ...mockSrsData };
      const mockProfile = { points: 100, weekly_points: 50, current_streak: 2, last_studied_at: new Date(Date.now() - 86400000).toISOString(), max_streak: 2 };

      // 1. Get Card
      supabase.single.mockImplementationOnce(() => ({ data: mockCurrentCard, error: null }));
      // 2. Calculate SRS
      srsService.calculateSm2.mockReturnValue(mockSrsData);
      
      // 3. Update Card (Primeira chamada a .update(), que é encadeada com .single())
      supabase.update.mockImplementationOnce(() => supabase); // .update() retorna 'this'
      supabase.single.mockImplementationOnce(() => ({ data: mockUpdatedCard, error: null })); // .single() retorna o card atualizado

      // 4. Insert History
      supabase.insert.mockImplementationOnce(() => ({ error: null }));
      
      // 5. Get Profile
      supabase.single.mockImplementationOnce(() => ({ data: mockProfile, error: null }));
      
      // 6. Mock para update do perfil (Segunda chamada a .update())
      // ***** A CORREÇÃO ESTÁ AQUI *****
      supabase.update.mockImplementationOnce(() => supabase); // Deve retornar 'supabase' (this) para permitir o .eq()
      // *******************************
      
      // 7. Mocks para contagens de achievements (select com count)
      supabase.__setMockCount(10); // review_history
      supabase.__setMockCount(2); // mastered_cards

      await flashcardController.reviewFlashcard(req, res);

      // Verificações
      expect(srsService.calculateSm2).toHaveBeenCalledWith(mockCurrentCard, 3);
      
      // Verifica o update do card
      expect(supabase.update).toHaveBeenNthCalledWith(1, mockSrsData);
      
      // Verifica o insert do histórico
      expect(supabase.insert).toHaveBeenCalled(); 
      
      // Verifica o update do perfil
      expect(supabase.update).toHaveBeenNthCalledWith(2, expect.objectContaining({
        points: 110,
        weekly_points: 60,
        current_streak: 3,
        max_streak: 3
      }));

      expect(achievementService.updateAchievementProgress).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Flashcard revisado com sucesso!',
        flashcard: mockUpdatedCard
      }));
    });
    
    it('deve retornar 403 se o card não pertencer ao usuário', async () => {
      const mockUser = { id: 'user-123' };
      const req = mockRequest({ quality: 3 }, { cardId: 'card-2' }, mockUser);
      const res = mockResponse();
      
      const mockOtherCard = {
        id: 'card-2',
        decks: { id: 'deck-2', user_id: 'user-999' } // Outro usuário
      };
      
      supabase.single.mockImplementationOnce(() => ({ data: mockOtherCard, error: null }));
      
      await flashcardController.reviewFlashcard(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('getExplanation', () => {
    
    it('deve retornar uma explicação do Cohere', async () => {
      const mockUser = { id: 'user-123' };
      const req = mockRequest({}, { cardId: 'card-1' }, mockUser);
      const res = mockResponse();
      
      const mockCard = {
        question: 'Q1',
        answer: 'A1',
        decks: { user_id: 'user-123' }
      };
      const mockExplanation = 'Esta é uma explicação da IA.';

      // 1. Mock para buscar o card (primeiro .single())
      supabase.single.mockImplementationOnce(() => ({ data: mockCard, error: null }));
      // 2. Mock para o Cohere
      cohereService.getExplanationForFlashcard.mockResolvedValue(mockExplanation);

      await flashcardController.getExplanation(req, res);
      
      expect(cohereService.getExplanationForFlashcard).toHaveBeenCalledWith('Q1', 'A1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ explanation: mockExplanation });
    });
  });
});