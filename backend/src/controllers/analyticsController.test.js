const analyticsController = require('./analyticsController');
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');
const cohereService = require('../services/cohereService');

jest.mock('../config/supabaseClient');
jest.mock('../config/logger');
jest.mock('../services/cohereService', () => ({
  generateStudyInsight: jest.fn(),
}));
jest.mock('../config/queue');

const mockRequest = (body = {}, query = {}, user = null) => ({
  body,
  query,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Analytics Controller', () => {

  beforeEach(() => {
    supabase.__resetMocks();
    logger.error.mockClear();
    cohereService.generateStudyInsight.mockClear();
  });

  describe('getReviewsOverTime', () => {
    it('deve retornar contagens de revisão diária (RPC)', async () => {
      const req = mockRequest({}, { range: 7 }, { id: 'user-123' });
      const res = mockResponse();
      const mockRpcData = [{ day: '2025-11-01', count: 10 }];
      
      supabase.rpc.mockResolvedValue({ data: mockRpcData, error: null });

      await analyticsController.getReviewsOverTime(req, res);

      expect(supabase.rpc).toHaveBeenCalledWith('get_daily_review_counts', {
        user_id_param: 'user-123',
        days_param: 7,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        labels: expect.any(Array),
        counts: [10],
      }));
    });
  });

  describe('getAnalyticsSummary', () => {
    it('deve retornar o sumário das estatísticas (RPC)', async () => {
      const req = mockRequest({}, {}, { id: 'user-123' });
      const res = mockResponse();
      const mockRpcData = [{ total_reviews: 50, average_accuracy: 80 }];
      
      supabase.rpc.mockResolvedValue({ data: mockRpcData, error: null });

      await analyticsController.getAnalyticsSummary(req, res);

      expect(supabase.rpc).toHaveBeenCalledWith('get_analytics_summary', {
        user_id_param: 'user-123',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRpcData[0]);
    });
  });

  describe('getPerformanceInsights', () => {
    it('deve retornar insights de desempenho (RPC + Cohere)', async () => {
      const req = mockRequest({}, {}, { id: 'user-123' });
      const res = mockResponse();
      const mockRpcData = [{ deck_title: 'Biologia', error_rate: 50 }];
      const mockInsight = 'Você precisa estudar mais Biologia.';

      supabase.rpc.mockResolvedValue({ data: mockRpcData, error: null });
      cohereService.generateStudyInsight.mockResolvedValue(mockInsight);

      await analyticsController.getPerformanceInsights(req, res);

      expect(supabase.rpc).toHaveBeenCalledWith('get_performance_insights', {
        user_id_param: 'user-123',
      });
      expect(cohereService.generateStudyInsight).toHaveBeenCalledWith(mockRpcData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        insight: mockInsight,
        difficultDecks: mockRpcData,
      });
    });
  });
});