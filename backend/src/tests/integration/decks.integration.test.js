const request = require('supertest');
const { createTestUser, cleanupTestUser, app } = require('../helpers/testHelpers');
const supabase = require('../../config/supabaseClient');

describe('Testes de Integração - Decks', () => {
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
  });

  afterEach(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId);
    }
  });

  describe('GET /api/decks (Rota Protegida)', () => {
    it('deve retornar lista de decks do usuário autenticado (200)', async () => {
      const response = await request(app)
        .get('/api/decks')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/decks');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 403 se token for inválido', async () => {
      const response = await request(app)
        .get('/api/decks')
        .set('Authorization', 'Bearer token_invalido');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/decks (Rota Protegida)', () => {
    it('deve criar um novo deck com sucesso (201)', async () => {
      const response = await request(app)
        .post('/api/decks')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          title: 'Deck de Teste',
          description: 'Descrição do deck de teste',
          color: '#FF5733'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Deck de Teste');
      expect(response.body.user_id).toBe(testUserId);
      
      testDeckId = response.body.id;
    });

    it('deve retornar erro 400 se título estiver faltando', async () => {
      const response = await request(app)
        .post('/api/decks')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          description: 'Descrição sem título'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .post('/api/decks')
        .send({
          title: 'Deck sem autenticação'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/decks/:id (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar um deck para atualizar
      const { data, error } = await supabase
        .from('decks')
        .insert([{
          title: 'Deck Original',
          user_id: testUserId
        }])
        .select()
        .single();
      
      if (error) throw error;
      testDeckId = data.id;
    });

    it('deve atualizar um deck existente com sucesso (200)', async () => {
      const response = await request(app)
        .put(`/api/decks/${testDeckId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          title: 'Deck Atualizado',
          description: 'Nova descrição'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testDeckId);
      expect(response.body.title).toBe('Deck Atualizado');
    });

    it('deve retornar erro 404 se deck não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/decks/${fakeId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          title: 'Deck Atualizado'
        });

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .put(`/api/decks/${testDeckId}`)
        .send({
          title: 'Deck Atualizado'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/decks/:id (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar um deck para deletar
      const { data, error } = await supabase
        .from('decks')
        .insert([{
          title: 'Deck para Deletar',
          user_id: testUserId
        }])
        .select()
        .single();
      
      if (error) throw error;
      testDeckId = data.id;
    });

    it('deve deletar um deck existente com sucesso (200)', async () => {
      const response = await request(app)
        .delete(`/api/decks/${testDeckId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      
      // Verificar se o deck foi deletado
      const { data: deletedDeck } = await supabase
        .from('decks')
        .select('*')
        .eq('id', testDeckId)
        .single();
      
      expect(deletedDeck).toBeNull();
    });

    it('deve retornar erro 404 se deck não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/decks/${fakeId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .delete(`/api/decks/${testDeckId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/decks/:id/publish (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar um deck para publicar
      const { data, error } = await supabase
        .from('decks')
        .insert([{
          title: 'Deck para Publicar',
          user_id: testUserId
        }])
        .select()
        .single();
      
      if (error) throw error;
      testDeckId = data.id;
    });

    it('deve publicar um deck com sucesso (200)', async () => {
      const response = await request(app)
        .post(`/api/decks/${testDeckId}/publish`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          is_public: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('is_public', true);
    });

    it('deve retornar erro 404 se deck não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/api/decks/${fakeId}/publish`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          is_public: true
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/decks/:id/review (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar um deck para revisão
      const { data, error } = await supabase
        .from('decks')
        .insert([{
          title: 'Deck para Revisão',
          user_id: testUserId
        }])
        .select()
        .single();
      
      if (error) throw error;
      testDeckId = data.id;
    });

    it('deve retornar cards para revisão (200)', async () => {
      const response = await request(app)
        .get(`/api/decks/${testDeckId}/review`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve retornar erro 404 se deck não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/decks/${fakeId}/review`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });
  });
});

