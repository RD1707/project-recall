const request = require('supertest');
const { createTestUser, cleanupTestUser, app } = require('../helpers/testHelpers');
const supabase = require('../../config/supabaseClient');

describe('Testes de Integração - Community', () => {
  let testUserEmail;
  let testUserId;
  let testUserToken;
  let testDeckId;

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

    // Criar um deck público para testes
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .insert([{
        title: 'Deck Público de Teste',
        user_id: testUserId,
        is_public: true
      }])
      .select()
      .single();
    
    if (deckError) throw deckError;
    testDeckId = deck.id;
  });

  afterEach(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId);
    }
  });

  describe('GET /api/community/decks (Rota Protegida)', () => {
    it('deve retornar lista de decks públicos (200)', async () => {
      const response = await request(app)
        .get('/api/community/decks')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/community/decks');

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 403 se token for inválido', async () => {
      const response = await request(app)
        .get('/api/community/decks')
        .set('Authorization', 'Bearer token_invalido');

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/community/decks/:deckId/view (Rota Protegida)', () => {
    it('deve retornar deck público para visualização (200)', async () => {
      const response = await request(app)
        .get(`/api/community/decks/${testDeckId}/view`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testDeckId);
    });

    it('deve retornar erro 404 se deck não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/community/decks/${fakeId}/view`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get(`/api/community/decks/${testDeckId}/view`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/community/decks/:deckId/clone (Rota Protegida)', () => {
    it('deve clonar um deck público com sucesso (200)', async () => {
      const response = await request(app)
        .post(`/api/community/decks/${testDeckId}/clone`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.user_id).toBe(testUserId);
    });

    it('deve retornar erro 404 se deck não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/api/community/decks/${fakeId}/clone`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .post(`/api/community/decks/${testDeckId}/clone`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/community/decks/:deckId/rate (Rota Protegida)', () => {
    it('deve avaliar um deck público com sucesso (200)', async () => {
      const response = await request(app)
        .post(`/api/community/decks/${testDeckId}/rate`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          rating: 5
        });

      expect(response.status).toBe(200);
    });

    it('deve retornar erro 400 se rating não for fornecido', async () => {
      const response = await request(app)
        .post(`/api/community/decks/${testDeckId}/rate`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .post(`/api/community/decks/${testDeckId}/rate`)
        .send({
          rating: 5
        });

      expect(response.status).toBe(401);
    });
  });
});

