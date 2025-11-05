const request = require('supertest');
const { createTestUser, cleanupTestUser, app } = require('../helpers/testHelpers');
const supabase = require('../../config/supabaseClient');

describe('Testes de Integração - Flashcards', () => {
  let testUserEmail;
  let testUserId;
  let testUserToken;
  let testDeckId;
  let testFlashcardId;

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

    // Criar um deck para os flashcards
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .insert([{
        title: 'Deck de Teste',
        user_id: testUserId
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

  describe('POST /api/decks/:deckId/flashcards (Rota Protegida)', () => {
    it('deve criar um flashcard com sucesso e associá-lo ao deck (201)', async () => {
      const response = await request(app)
        .post(`/api/decks/${testDeckId}/flashcards`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          question: 'Qual é a capital do Brasil?',
          answer: 'Brasília',
          card_type: 'Pergunta e Resposta'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('deck_id', testDeckId);
      expect(response.body.question).toBe('Qual é a capital do Brasil?');
      expect(response.body.answer).toBe('Brasília');
      
      testFlashcardId = response.body.id;

      // Verificar se o flashcard foi realmente criado no banco
      const { data: flashcard } = await supabase
        .from('flashcards')
        .select('*')
        .eq('id', testFlashcardId)
        .single();
      
      expect(flashcard).toBeTruthy();
      expect(flashcard.deck_id).toBe(testDeckId);
    });

    it('deve retornar erro 400 se campos obrigatórios estiverem faltando', async () => {
      const response = await request(app)
        .post(`/api/decks/${testDeckId}/flashcards`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          question: 'Qual é a capital do Brasil?'
          // answer faltando
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 404 se deck não existir', async () => {
      const fakeDeckId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/api/decks/${fakeDeckId}/flashcards`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          question: 'Pergunta?',
          answer: 'Resposta'
        });

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 401 se token não for fornecido', async () => {
      const response = await request(app)
        .post(`/api/decks/${testDeckId}/flashcards`)
        .send({
          question: 'Pergunta?',
          answer: 'Resposta'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/decks/:deckId/flashcards (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar alguns flashcards para o deck
      const { data, error } = await supabase
        .from('flashcards')
        .insert([
          {
            deck_id: testDeckId,
            question: 'Pergunta 1?',
            answer: 'Resposta 1'
          },
          {
            deck_id: testDeckId,
            question: 'Pergunta 2?',
            answer: 'Resposta 2'
          }
        ])
        .select();
      
      if (error) throw error;
    });

    it('deve retornar lista de flashcards do deck (200)', async () => {
      const response = await request(app)
        .get(`/api/decks/${testDeckId}/flashcards`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('deve retornar erro 404 se deck não existir', async () => {
      const fakeDeckId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/decks/${fakeDeckId}/flashcards`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/flashcards/:cardId (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar um flashcard para atualizar
      const { data, error } = await supabase
        .from('flashcards')
        .insert([{
          deck_id: testDeckId,
          question: 'Pergunta Original?',
          answer: 'Resposta Original'
        }])
        .select()
        .single();
      
      if (error) throw error;
      testFlashcardId = data.id;
    });

    it('deve atualizar um flashcard existente com sucesso (200)', async () => {
      const response = await request(app)
        .put(`/api/flashcards/${testFlashcardId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          question: 'Pergunta Atualizada?',
          answer: 'Resposta Atualizada'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testFlashcardId);
      expect(response.body.question).toBe('Pergunta Atualizada?');
      expect(response.body.answer).toBe('Resposta Atualizada');
    });

    it('deve retornar erro 404 se flashcard não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/flashcards/${fakeId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          question: 'Pergunta Atualizada?',
          answer: 'Resposta Atualizada'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/flashcards/:cardId (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar um flashcard para deletar
      const { data, error } = await supabase
        .from('flashcards')
        .insert([{
          deck_id: testDeckId,
          question: 'Pergunta para Deletar?',
          answer: 'Resposta'
        }])
        .select()
        .single();
      
      if (error) throw error;
      testFlashcardId = data.id;
    });

    it('deve deletar um flashcard existente com sucesso (200)', async () => {
      const response = await request(app)
        .delete(`/api/flashcards/${testFlashcardId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      
      // Verificar se o flashcard foi deletado
      const { data: deletedCard } = await supabase
        .from('flashcards')
        .select('*')
        .eq('id', testFlashcardId)
        .single();
      
      expect(deletedCard).toBeNull();
    });

    it('deve retornar erro 404 se flashcard não existir', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/flashcards/${fakeId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/flashcards/:cardId/review (Rota Protegida)', () => {
    beforeEach(async () => {
      // Criar um flashcard para revisar
      const { data, error } = await supabase
        .from('flashcards')
        .insert([{
          deck_id: testDeckId,
          question: 'Pergunta para Revisar?',
          answer: 'Resposta'
        }])
        .select()
        .single();
      
      if (error) throw error;
      testFlashcardId = data.id;
    });

    it('deve processar revisão do flashcard com sucesso (200)', async () => {
      const response = await request(app)
        .post(`/api/flashcards/${testFlashcardId}/review`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          quality: 4 // qualidade da resposta (0-5)
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('next_review_date');
    });

    it('deve retornar erro 400 se quality não for fornecido', async () => {
      const response = await request(app)
        .post(`/api/flashcards/${testFlashcardId}/review`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 400 se quality estiver fora do range (0-5)', async () => {
      const response = await request(app)
        .post(`/api/flashcards/${testFlashcardId}/review`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          quality: 10 // fora do range
        });

      expect(response.status).toBe(400);
    });
  });
});

