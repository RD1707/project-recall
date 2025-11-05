const request = require('supertest');
const { createTestUser, cleanupTestUser, app } = require('../helpers/testHelpers');
const supabase = require('../../config/supabaseClient');

describe('Testes de Integração - Analytics', () => {
  let testUserEmail;
  let testUserId;
  let testUserToken;

  beforeEach(async () => {
    testUserEmail = `test${Date.now()}${Math.random().toString(36).substring(7)}@example.com`;
    const testUser = await createTestUser(
      testUserEmail,
      'password123',
      `testuser${Date.now()}`,
      'Test User'
    );
    testUserId = testUser.user.id;
    testUserToken = testUser.token;
  });

  afterEach(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId);
    }
  });

  describe('GET /api/analytics/reviews-over-time (Rota Protegida)', () => {
    it('deve retornar dados de revisões ao longo do tempo (200)', async () => {
      const response = await request(app)
        .get('/api/analytics/reviews-over-time')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/analytics/reviews-over-time');

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 403 se token for inválido', async () => {
      const response = await request(app)
        .get('/api/analytics/reviews-over-time')
        .set('Authorization', 'Bearer token_invalido');

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/analytics/insights (Rota Protegida)', () => {
    it('deve retornar insights de performance (200)', async () => {
      const response = await request(app)
        .get('/api/analytics/insights')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('insights');
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/analytics/insights');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/analytics/summary (Rota Protegida)', () => {
    it('deve retornar resumo de analytics (200)', async () => {
      const response = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/analytics/summary');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/analytics/recent-activity (Rota Protegida)', () => {
    it('deve retornar atividade recente (200)', async () => {
      const response = await request(app)
        .get('/api/analytics/recent-activity')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/analytics/recent-activity');

      expect(response.status).toBe(401);
    });
  });
});

