const deckController = require('./deckController');
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');
const achievementService = require('../services/achievementService'); 
const { z } = require('zod');

// Diz ao Jest para usar nossos mocks
jest.mock('../config/supabaseClient');
jest.mock('../config/logger');
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

describe('Deck Controller', () => {

  beforeEach(() => {
    supabase.__resetMocks();
    logger.error.mockClear();
    achievementService.updateAchievementProgress.mockClear();
  });

  describe('createDeck', () => {
    
    it('deve criar um baralho com sucesso e atualizar conquistas', async () => {
      const mockUser = { id: 'user-123' };
      const mockDeckData = { title: 'Novo Baralho', description: 'Desc' };
      const req = mockRequest(mockDeckData, {}, mockUser);
      const res = mockResponse();

      const mockCreatedDeck = { id: 1, user_id: 'user-123', ...mockDeckData };
      
      // 1. Configura os dados que o .insert().select().single() deve retornar
      supabase.__setMockData(mockCreatedDeck);
      
      // 2. Mocka o PRIMEIRO .select() (que é parte do .insert())
      //    Ele deve retornar 'supabase' para continuar a cadeia .single()
      supabase.select.mockImplementationOnce(() => supabase); 

      // 3. Mocka o SEGUNDO .select() (o que busca o count)
      //    Este DEVE retornar 'supabase' para que .eq() possa ser chamado.
      supabase.select.mockImplementationOnce(() => supabase); 
      
      // 4. ***** ESTA É A CORREÇÃO *****
      //    Mocka o .eq() que é chamado LOGO APÓS o segundo select.
      //    Este .eq() é o que finalmente retorna o objeto de contagem.
      supabase.eq.mockImplementationOnce(() => ({ 
        count: 1, 
        error: null 
      }));

      // Executa o controller
      await deckController.createDeck(req, res);

      // Verifica se o insert foi chamado
      expect(supabase.from).toHaveBeenCalledWith('decks');
      expect(supabase.insert).toHaveBeenCalledWith([expect.objectContaining({
        title: 'Novo Baralho',
        user_id: 'user-123',
      })]);
      
      // Verifica se o select de contagem foi chamado
      expect(supabase.from).toHaveBeenCalledWith('decks');
      expect(supabase.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      // AGORA DEVE PASSAR
      expect(supabase.eq).toHaveBeenCalledWith('user_id', 'user-123'); 

      // Verifica se o achievement foi chamado
      expect(achievementService.updateAchievementProgress).toHaveBeenCalledWith('user-123', 'decks_created', 1);
      expect(achievementService.updateAchievementProgress).toHaveBeenCalledWith('user-123', 'decks_created_total', 1);

      // Verifica a resposta
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Baralho criado com sucesso!',
        deck: mockCreatedDeck,
      }));
    });

    it('deve retornar erro 400 se o título estiver faltando (validação Zod)', async () => {
      const mockUser = { id: 'user-123' };
      const req = mockRequest({ description: 'Deck sem título' }, {}, mockUser);
      const res = mockResponse();

      // Limpa os logs de console específicos deste teste para não poluir
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await deckController.createDeck(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'O título é obrigatório.',
        code: 'VALIDATION_ERROR',
      }));

      consoleLogSpy.mockRestore(); // Restaura o console.log
    });

  });
});