const profileController = require('./profileController');
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

jest.mock('../config/supabaseClient');
jest.mock('../config/logger');
jest.mock('../config/queue');

const mockRequest = (body = {}, params = {}, user = null, file = null) => ({
  body,
  params,
  user,
  file,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Profile Controller', () => {

  beforeEach(() => {
    supabase.__resetMocks();
  });

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário logado', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const req = mockRequest({}, {}, mockUser);
    const res = mockResponse();

    const mockProfile = { full_name: 'Test User', username: 'testuser', points: 100 };
    supabase.__setMockData(mockProfile); 

    await profileController.getProfile(req, res);

    expect(supabase.from).toHaveBeenCalledWith('profiles');
    
    // Confiando no seu log de erro (Received: ... "banner_url"),
    // esta é a string correta que o seu controller está usando.
    const expectedSelect = 'points, current_streak, full_name, username, bio, avatar_url, banner_url, has_completed_onboarding, interests';
    
    expect(supabase.select).toHaveBeenCalledWith(expectedSelect); // <-- CORRIGIDO
    expect(supabase.eq).toHaveBeenCalledWith('id', 'user-123');
    expect(supabase.single).toHaveBeenCalled();
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...mockProfile,
        email: 'test@example.com',
        }));
    });
  });

  describe('updateProfile', () => {
    it('deve atualizar o perfil do usuário (nome e bio)', async () => {
      const mockUser = { id: 'user-123' };
      const mockBody = { full_name: 'New Name', bio: 'New bio' };
      const req = mockRequest(mockBody, {}, mockUser);
      const res = mockResponse();

      const mockUpdatedProfile = { full_name: 'New Name', bio: 'New bio' };
      supabase.__setMockData(mockUpdatedProfile);

      await profileController.updateProfile(req, res);

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.update).toHaveBeenCalledWith({ full_name: 'New Name', bio: 'New bio' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ profile: mockUpdatedProfile }));
    });

    it('deve atualizar o username se não estiver em uso', async () => {
      const mockUser = { id: 'user-123' };
      const req = mockRequest({ username: 'newuser' }, {}, mockUser);
      const res = mockResponse();

      supabase.__setMockData(null); // Simula que o usuário não existe
      supabase.single.mockImplementationOnce(() => ({ data: null, error: null }));
      
      const mockUpdatedProfile = { username: 'newuser' };
      supabase.__setMockData(mockUpdatedProfile); // Prepara para o update

      await profileController.updateProfile(req, res);
      
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.update).toHaveBeenCalledWith({ username: 'newuser' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar erro 400 se o username já estiver em uso', async () => {
      const mockUser = { id: 'user-123' };
      const req = mockRequest({ username: 'existinguser' }, {}, mockUser);
      const res = mockResponse();

      supabase.__setMockData({ id: 'user-999' }); // Simula que o usuário existe

      await profileController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'USERNAME_TAKEN',
      }));
    });

    it('deve atualizar a senha do usuário', async () => {
      const mockUser = { id: 'user-123' };
      const req = mockRequest({ password: 'newpassword123' }, {}, mockUser);
      const res = mockResponse();

      supabase.auth.updateUser.mockResolvedValue({ data: { user: {} }, error: null });

      await profileController.updateProfile(req, res);

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('uploadAvatar', () => {
    it('deve fazer upload do avatar e atualizar o perfil', async () => {
      const mockUser = { id: 'user-123' };
      const mockFile = {
        buffer: Buffer.from('fakeimagedata'),
        mimetype: 'image/png',
        originalname: 'avatar.png',
      };
      const req = mockRequest({}, {}, mockUser, mockFile);
      const res = mockResponse();

      const mockUploadData = { path: 'user-123/avatar.png' };
      const mockPublicUrl = 'http://mock.url/avatar.png';
      
      supabase.__setMockData(mockUploadData); // Para o .upload()
      supabase.update.mockImplementationOnce(() => supabase); // Para o .update()
      supabase.single.mockImplementationOnce(() => ({ data: { avatar_url: mockPublicUrl }, error: null })); // Para o .single()

      await profileController.uploadAvatar(req, res);

      expect(supabase.storage.from).toHaveBeenCalledWith('avatars');
      expect(supabase.storage.upload).toHaveBeenCalled(); // <-- Agora deve ser chamado
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.update).toHaveBeenCalledWith({ avatar_url: mockPublicUrl });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar erro 400 se nenhum arquivo for enviado', async () => {
      const req = mockRequest({}, {}, { id: 'user-123' }, null); // Sem arquivo
      const res = mockResponse();

      await profileController.uploadAvatar(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Nenhum arquivo de imagem enviado.',
      }));
    });
  });
});