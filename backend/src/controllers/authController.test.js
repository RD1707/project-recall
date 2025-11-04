const authController = require('./authController'); 
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

// Diz ao Jest para usar nossos mocks automáticos
jest.mock('../config/supabaseClient');
jest.mock('../config/logger');
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

describe('Auth Controller', () => {

  beforeEach(() => {
    supabase.__resetMocks();
    logger.error.mockClear();
    logger.info.mockClear();
  });

  describe('signup', () => {
    
    it('deve registrar um novo usuário com sucesso', async () => {
    const req = mockRequest({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        username: 'testuser',
    });
    const res = mockResponse();

    // 1. Mock da primeira chamada (checagem de username): .single() deve retornar null
    supabase.single.mockImplementationOnce(() => ({ data: null, error: null }));
    
    // 2. Mock da segunda chamada (auth.signUp): deve retornar o novo usuário
    supabase.auth.signUp.mockImplementationOnce(() => ({
        data: { user: { id: '12345', email: 'test@example.com' } },
        error: null,
    }));

    await authController.signup(req, res);

    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.eq).toHaveBeenCalledWith('username', 'testuser');
    expect(supabase.single).toHaveBeenCalled(); // Verifica se a checagem foi feita
    expect(supabase.auth.signUp).toHaveBeenCalled(); // Verifica se o registro foi feito
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    user: expect.objectContaining({ id: '12345' }),
  }));
});

    it('deve retornar erro 400 se o username já existir', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        username: 'testuser',
      });
      const res = mockResponse();

      // Simula que o username JÁ EXISTE
      supabase.__setMockData({ username: 'testuser' }); 

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400); // <-- Corrigido
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Este nome de usuário já está em uso.',
        field: 'username',
      }));
    });

    it('deve retornar erro 400 se o username já existir', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        username: 'testuser',
      });
      const res = mockResponse();

      supabase.__setMockData({ username: 'testuser' }); // Simula que o username JÁ EXISTE

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400); // <-- Corrigido
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Este nome de usuário já está em uso.',
        field: 'username',
      }));
    });

    it('deve retornar erro 400 para validação (username curto)', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        username: 'tu', 
      });
      const res = mockResponse();

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Usuário deve ter 3-20 caracteres'),
      }));
    });

    it('deve retornar erro 500 se o Supabase falhar inesperadamente', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        username: 'testuser',
      });
      const res = mockResponse();

      const mockError = new Error('Falha na conexão com o banco');
      supabase.__setMockError(mockError); // Simula erro genérico

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Erro interno do servidor ao criar conta.',
      }));
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve logar um usuário com sucesso', async () => {
      const req = mockRequest({ email: 'test@example.com', password: 'password123' });
      const res = mockResponse();
      
      const mockSession = { access_token: 'fake_token' };
      supabase.__setMockData(mockSession); // Simula o sucesso do login
      
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Login bem-sucedido!',
        session: mockSession,
      }));
    });

    it('deve retornar erro 400 para credenciais inválidas', async () => {
      const req = mockRequest({ email: 'test@example.com', password: 'wrongpassword' });
      const res = mockResponse();
      
      supabase.__setMockError(new Error('Invalid login credentials'));
      
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'E-mail ou senha inválidos.' });
    });
  });
});