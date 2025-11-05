const request = require('supertest');
const { createTestUser, cleanupTestUser, app } = require('../helpers/testHelpers');
const supabase = require('../../config/supabaseClient');

describe('Testes de Integração - Sinapse', () => {
  let testUserEmail;
  let testUserId;
  let testUserToken;
  let conversationId;

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
      // Limpar conversas antes de limpar usuário
      if (conversationId) {
        await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId);
      }
      await cleanupTestUser(testUserId);
    }
  });

  describe('POST /api/sinapse/conversations (Rota Protegida)', () => {
    it('deve criar uma nova conversa com sucesso (201)', async () => {
      const response = await request(app)
        .post('/api/sinapse/conversations')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          title: 'Conversa de Teste'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('user_id', testUserId);
      
      conversationId = response.body.id;
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .post('/api/sinapse/conversations')
        .send({
          title: 'Conversa de Teste'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sinapse/conversations (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar uma conversa para listar
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          user_id: testUserId,
          title: 'Conversa de Teste'
        }])
        .select()
        .single();
      
      if (error) throw error;
      conversationId = data.id;
    });

    it('deve retornar lista de conversas do usuário (200)', async () => {
      const response = await request(app)
        .get('/api/sinapse/conversations')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/sinapse/conversations');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/sinapse/conversations/:conversationId/messages (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar uma conversa para enviar mensagem
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          user_id: testUserId,
          title: 'Conversa para Mensagem'
        }])
        .select()
        .single();
      
      if (error) throw error;
      conversationId = data.id;
    });

    it('deve enviar uma mensagem com sucesso (201)', async () => {
      const response = await request(app)
        .post(`/api/sinapse/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          content: 'Mensagem de teste',
          role: 'USER'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('conversation_id', conversationId);
      expect(response.body.content).toBe('Mensagem de teste');
    });

    it('deve retornar erro 400 se campos obrigatórios estiverem faltando', async () => {
      const response = await request(app)
        .post(`/api/sinapse/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          // content faltando
          role: 'USER'
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 404 se conversa não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/api/sinapse/conversations/${fakeId}/messages`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          content: 'Mensagem de teste',
          role: 'USER'
        });

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .post(`/api/sinapse/conversations/${conversationId}/messages`)
        .send({
          content: 'Mensagem de teste',
          role: 'USER'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sinapse/conversations/:conversationId/messages (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar uma conversa e mensagem para listar
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert([{
          user_id: testUserId,
          title: 'Conversa para Listar Mensagens'
        }])
        .select()
        .single();
      
      if (convError) throw convError;
      conversationId = conv.id;

      // Criar uma mensagem
      await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          content: 'Mensagem de teste',
          role: 'USER'
        }]);
    });

    it('deve retornar lista de mensagens da conversa (200)', async () => {
      const response = await request(app)
        .get(`/api/sinapse/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('deve retornar erro 404 se conversa não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/sinapse/conversations/${fakeId}/messages`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sinapse/conversations/:conversationId (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar uma conversa para deletar
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          user_id: testUserId,
          title: 'Conversa para Deletar'
        }])
        .select()
        .single();
      
      if (error) throw error;
      conversationId = data.id;
    });

    it('deve deletar uma conversa com sucesso (200)', async () => {
      const response = await request(app)
        .delete(`/api/sinapse/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      
      // Verificar se foi deletado
      const { data: deletedConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      expect(deletedConv).toBeNull();
    });

    it('deve retornar erro 404 se conversa não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/sinapse/conversations/${fakeId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .delete(`/api/sinapse/conversations/${conversationId}`);

      expect(response.status).toBe(401);
    });
  });
});

