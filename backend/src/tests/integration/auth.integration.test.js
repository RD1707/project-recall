const request = require('supertest');
const { createTestUser, loginTestUser, cleanupTestUser, app } = require('../helpers/testHelpers');
const supabase = require('../../config/supabaseClient');

describe('Testes de Integração - Autenticação', () => {
  let testUserEmail;
  let testUserId;
  let testUserToken;

  beforeEach(() => {
    // Gerar email único para cada teste
    testUserEmail = `test${Date.now()}${Math.random().toString(36).substring(7)}@example.com`;
  });

  afterEach(async () => {
    // Limpar dados de teste após cada teste
    if (testUserId) {
      await cleanupTestUser(testUserId);
    }
  });

  describe('POST /api/auth/signup', () => {
    it('deve criar um novo usuário com sucesso (201)', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: testUserEmail,
          password: 'password123',
          full_name: 'Test User',
          username: `testuser${Date.now()}`
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUserEmail);
      
      testUserId = response.body.user.id;
    });

    it('deve retornar erro 400 se campos obrigatórios estiverem faltando', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: testUserEmail,
          // password faltando
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('obrigatórios');
    });

    it('deve retornar erro 400 se username for inválido (muito curto)', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: testUserEmail,
          password: 'password123',
          full_name: 'Test User',
          username: 'ab' // muito curto
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('field', 'username');
    });

    it('deve retornar erro 400 se email já estiver cadastrado', async () => {
      // Criar primeiro usuário
      const firstUser = await createTestUser(
        testUserEmail,
        'password123',
        `testuser${Date.now()}`,
        'First User'
      );
      testUserId = firstUser.user.id;

      // Tentar criar outro com mesmo email
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: testUserEmail,
          password: 'password123',
          full_name: 'Second User',
          username: `testuser${Date.now()}`
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('field', 'email');
    });

    it('deve retornar erro 400 se username já estiver em uso', async () => {
      const username = `testuser${Date.now()}`;
      
      // Criar primeiro usuário
      const firstUser = await createTestUser(
        testUserEmail,
        'password123',
        username,
        'First User'
      );
      testUserId = firstUser.user.id;

      // Tentar criar outro com mesmo username
      const anotherEmail = `test2${Date.now()}@example.com`;
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: anotherEmail,
          password: 'password123',
          full_name: 'Second User',
          username: username
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('field', 'username');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Criar usuário de teste antes de cada teste de login
      const testUser = await createTestUser(
        testUserEmail,
        'password123',
        `testuser${Date.now()}`,
        'Test User'
      );
      testUserId = testUser.user.id;
    });

    it('deve fazer login com sucesso e retornar token (200)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login bem-sucedido!');
      expect(response.body).toHaveProperty('session');
      expect(response.body.session).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      
      testUserToken = response.body.session.access_token;
    });

    it('deve retornar erro 400 se email ou senha estiverem faltando', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail
          // password faltando
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 400 para credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'senha_incorreta'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'E-mail ou senha inválidos.');
    });

    it('deve retornar erro 400 para email não cadastrado', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('deve retornar sucesso mesmo se email não existir (segurança)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'naoexiste@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 400 se email não for fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 400 se email for inválido', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'email_invalido'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('deve retornar erro 400 se token não for fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          password: 'newpassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 400 se senha for muito curta', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          access_token: 'fake_token',
          password: '12345' // menos de 6 caracteres
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/ensure-profile (Rota Protegida)', () => {
    beforeEach(async () => {
      const testUser = await createTestUser(
        testUserEmail,
        'password123',
        `testuser${Date.now()}`,
        'Test User'
      );
      testUserId = testUser.user.id;
      testUserToken = testUser.token;
    });

    it('deve retornar perfil do usuário autenticado (200)', async () => {
      const response = await request(app)
        .get('/api/auth/ensure-profile')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('profile');
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .get('/api/auth/ensure-profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 403 se token for inválido', async () => {
      const response = await request(app)
        .get('/api/auth/ensure-profile')
        .set('Authorization', 'Bearer token_invalido_12345');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/complete-google-profile (Rota Protegida)', () => {
    beforeEach(async () => {
      const testUser = await createTestUser(
        testUserEmail,
        'password123',
        `testuser${Date.now()}`,
        'Test User'
      );
      testUserId = testUser.user.id;
      testUserToken = testUser.token;
    });

    it('deve completar perfil Google com sucesso (200)', async () => {
      const response = await request(app)
        .post('/api/auth/complete-google-profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          fullName: 'Complete Google User',
          username: `googleuser${Date.now()}`
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('profile');
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/complete-google-profile')
        .send({
          fullName: 'Complete Google User',
          username: `googleuser${Date.now()}`
        });

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 400 se campos obrigatórios estiverem faltando', async () => {
      const response = await request(app)
        .post('/api/auth/complete-google-profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          fullName: 'Complete Google User'
          // username faltando
        });

      expect(response.status).toBe(400);
    });
  });
});

