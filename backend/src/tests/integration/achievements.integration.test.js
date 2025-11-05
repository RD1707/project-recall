const request = require('supertest');
const { createTestUser, cleanupTestUser, app } = require('../helpers/testHelpers');

describe('Testes de Integração - Achievements', () => {
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

  describe('GET /api/achievements (Rota Protegida)', () => {
    it('deve retornar lista de conquistas do usuário (200)', async () => {
      const response = await request(app)
        .get('/api/achievements')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/achievements');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 403 se token for inválido', async () => {
      const response = await request(app)
        .get('/api/achievements')
        .set('Authorization', 'Bearer token_invalido');

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/achievements/recalculate (Rota Protegida)', () => {
    it('deve recalcular conquistas do usuário (200)', async () => {
      const response = await request(app)
        .post('/api/achievements/recalculate')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .post('/api/achievements/recalculate');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/achievements/force-recalculate (Rota Protegida)', () => {
    it('deve forçar recálculo de conquistas (200)', async () => {
      const response = await request(app)
        .post('/api/achievements/force-recalculate')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .post('/api/achievements/force-recalculate');

      expect(response.status).toBe(401);
    });
  });
});

