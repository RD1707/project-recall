const request = require('supertest');
const { createTestUser, cleanupTestUser, app } = require('../helpers/testHelpers');
const supabase = require('../../config/supabaseClient');

describe('Testes de Integração - Share', () => {
  let testUserEmail;
  let testUserId;
  let testUserToken;
  let shareableId;

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

    // Criar um deck com shareable_id
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .insert([{
        title: 'Deck Compartilhável',
        user_id: testUserId,
        is_public: true
      }])
      .select()
      .single();
    
    if (deckError) throw deckError;
    
    // Gerar ou atualizar shareable_id
    shareableId = deck.shareable_id || 'test-share-id-' + Date.now();
    
    if (!deck.shareable_id) {
      await supabase
        .from('decks')
        .update({ shareable_id: shareableId })
        .eq('id', deck.id);
    }
  });

  afterEach(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId);
    }
  });

  describe('GET /api/shared/:shareableId (Rota Pública)', () => {
    it('deve retornar deck compartilhado por shareableId (200)', async () => {
      const response = await request(app)
        .get(`/api/shared/${shareableId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('shareable_id', shareableId);
    });

    it('deve retornar erro 404 se shareableId não existir', async () => {
      const fakeShareableId = 'shareable-id-inexistente-12345';
      const response = await request(app)
        .get(`/api/shared/${fakeShareableId}`);

      expect(response.status).toBe(404);
    });
  });
});

