const shareController = require('./shareController');
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

jest.mock('../config/supabaseClient');
jest.mock('../config/logger');
jest.mock('../config/queue');

const mockRequest = (body = {}, params = {}) => ({
  body,
  params,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Share Controller', () => {

  beforeEach(() => {
    supabase.__resetMocks();
    logger.error.mockClear();
  });

  describe('getSharedDeck', () => {
    it('deve retornar um baralho compartilhado e seus cards', async () => {
      const req = mockRequest({}, { shareableId: 'share-123' });
      const res = mockResponse();

      const mockDeck = { id: 'deck-1', title: 'Baralho Público', description: 'Desc' };
      const mockFlashcards = [{ question: 'Q1', answer: 'A1' }];

      // 1. Mock para buscar o baralho
      supabase.single.mockImplementationOnce(() => ({ data: mockDeck, error: null }));
      // 2. Mock para buscar os flashcards
      supabase.__setMockData(mockFlashcards);
      supabase.select.mockImplementationOnce(() => supabase); // .select()
      supabase.order.mockImplementationOnce(() => ({ data: mockFlashcards, error: null })); // .order()

      await shareController.getSharedDeck(req, res);
      
      expect(supabase.from).toHaveBeenCalledWith('decks');
      expect(supabase.eq).toHaveBeenCalledWith('shareable_id', 'share-123');
      expect(supabase.from).toHaveBeenCalledWith('flashcards');
      expect(supabase.eq).toHaveBeenCalledWith('deck_id', 'deck-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        title: 'Baralho Público',
        description: 'Desc',
        flashcards: mockFlashcards,
      });
    });

    it('deve retornar 404 se o baralho não for encontrado ou não for público', async () => {
      const req = mockRequest({}, { shareableId: 'share-404' });
      const res = mockResponse();

      // Mock para falha ao buscar baralho
      supabase.single.mockImplementationOnce(() => ({ data: null, error: true }));

      await shareController.getSharedDeck(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'NOT_FOUND',
      }));
    });
  });
});