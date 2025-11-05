const request = require('supertest');
const { createTestUser, cleanupTestUser, app } = require('../helpers/testHelpers');
const supabase = require('../../config/supabaseClient');

describe('Testes de Integração - Profile', () => {
  let testUserEmail;
  let testUserId;
  let testUserToken;
  let testUsername;

  beforeEach(async () => {
    testUserEmail = `test${Date.now()}${Math.random().toString(36).substring(7)}@example.com`;
    testUsername = `testuser${Date.now()}`;
    const testUser = await createTestUser(
      testUserEmail,
      'password123',
      testUsername,
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

  describe('GET /api/profile (Rota Protegida)', () => {
    it('deve retornar perfil do usuário autenticado (200)', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body).toHaveProperty('username');
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 403 se token for inválido', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer token_invalido');

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/profile (Rota Protegida)', () => {
    it('deve atualizar perfil do usuário com sucesso (200)', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          full_name: 'Nome Atualizado',
          bio: 'Nova biografia'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('full_name', 'Nome Atualizado');
      expect(response.body).toHaveProperty('bio', 'Nova biografia');
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({
          full_name: 'Nome Atualizado'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/profile/public/:username (Rota Pública)', () => {
    it('deve retornar perfil público por username (200)', async () => {
      const response = await request(app)
        .get(`/api/profile/public/${testUsername}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', testUsername);
    });

    it('deve retornar erro 404 se username não existir', async () => {
      const response = await request(app)
        .get('/api/profile/public/username_inexistente_12345');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/profile/leaderboard (Rota Pública)', () => {
    it('deve retornar leaderboard (200)', async () => {
      const response = await request(app)
        .get('/api/profile/leaderboard');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/profile/user/:username (Rota Pública)', () => {
    it('deve retornar perfil por username (200)', async () => {
      const response = await request(app)
        .get(`/api/profile/user/${testUsername}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', testUsername);
    });
  });

  describe('GET /api/profile/recent-activity (Rota Protegida)', () => {
    it('deve retornar atividade recente do usuário (200)', async () => {
      const response = await request(app)
        .get('/api/profile/recent-activity')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/profile/recent-activity');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/profile/onboarding-complete (Rota Protegida)', () => {
    it('deve marcar onboarding como completo (200)', async () => {
      const response = await request(app)
        .post('/api/profile/onboarding-complete')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          has_completed_onboarding: true
        });

      expect(response.status).toBe(200);
      
      // Verificar se foi atualizado no banco
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', testUserId)
        .single();
      
      expect(profile.has_completed_onboarding).toBe(true);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .post('/api/profile/onboarding-complete')
        .send({
          has_completed_onboarding: true
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/profile/delete-account (Rota Protegida)', () => {
    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .delete('/api/profile/delete-account');

      expect(response.status).toBe(401);
    });

    // Nota: Teste de deleção real pode ser perigoso, então só testamos autenticação
  });
});

