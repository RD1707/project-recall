# Testes de Integração

Este diretório contém os testes de integração do sistema, utilizando **Jest** e **Supertest** para testar a comunicação entre diferentes componentes do sistema, incluindo endpoints da API, regras de negócio e integração com o banco de dados.

## Estrutura

```
tests/
├── helpers/
│   └── testHelpers.js          # Funções auxiliares para testes
├── integration/
│   ├── auth.integration.test.js      # Testes de autenticação
│   ├── decks.integration.test.js     # Testes de decks
│   ├── flashcards.integration.test.js # Testes de flashcards
│   ├── profile.integration.test.js    # Testes de perfil
│   ├── analytics.integration.test.js  # Testes de analytics
│   ├── achievements.integration.test.js # Testes de conquistas
│   ├── community.integration.test.js # Testes de comunidade
│   ├── share.integration.test.js     # Testes de compartilhamento
│   └── sinapse.integration.test.js   # Testes de sinapse
├── setup.js                     # Configuração global dos testes
└── README.md                     # Este arquivo
```

## Como Executar

### Executar todos os testes de integração:
```bash
cd backend
npm test
```

### Executar um arquivo específico:
```bash
npm test -- auth.integration.test.js
```

### Executar testes em modo watch:
```bash
npm test -- --watch
```

## Requisitos

1. **Variáveis de Ambiente**: Certifique-se de que as variáveis de ambiente estão configuradas no arquivo `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL` (opcional)

2. **Banco de Dados**: Os testes de integração fazem requisições reais ao banco de dados Supabase. Certifique-se de que:
   - O banco de dados está acessível
   - As tabelas necessárias existem
   - Os dados de teste são limpos após cada teste

## Tipos de Testes Implementados

### 1. Testes de Autenticação (`auth.integration.test.js`)
- ✅ POST /api/auth/signup - Criar usuário
- ✅ POST /api/auth/login - Login
- ✅ POST /api/auth/forgot-password - Recuperar senha
- ✅ POST /api/auth/reset-password - Redefinir senha
- ✅ GET /api/auth/ensure-profile - Garantir perfil (protegido)
- ✅ POST /api/auth/complete-google-profile - Completar perfil Google (protegido)

**Validações testadas:**
- Criar usuário com sucesso (201)
- Validação de campos obrigatórios (400)
- Validação de username/email duplicados (400)
- Login com credenciais válidas (200)
- Login com credenciais inválidas (400)
- Rotas protegidas sem token (401)
- Rotas protegidas com token inválido (403)

### 2. Testes de Decks (`decks.integration.test.js`)
- ✅ GET /api/decks - Listar decks (protegido)
- ✅ POST /api/decks - Criar deck (protegido)
- ✅ PUT /api/decks/:id - Atualizar deck (protegido)
- ✅ DELETE /api/decks/:id - Deletar deck (protegido)
- ✅ POST /api/decks/:id/publish - Publicar deck (protegido)
- ✅ GET /api/decks/:id/review - Obter cards para revisão (protegido)

**Validações testadas:**
- Listar decks do usuário autenticado (200)
- Criar deck com sucesso (201)
- Atualizar deck existente (200)
- Deletar deck existente (200)
- Publicar deck (200)
- Rotas protegidas sem token (401)
- Rotas protegidas com token inválido (403)

### 3. Testes de Flashcards (`flashcards.integration.test.js`)
- ✅ POST /api/decks/:deckId/flashcards - Criar flashcard (protegido)
- ✅ GET /api/decks/:deckId/flashcards - Listar flashcards (protegido)
- ✅ PUT /api/flashcards/:cardId - Atualizar flashcard (protegido)
- ✅ DELETE /api/flashcards/:cardId - Deletar flashcard (protegido)
- ✅ POST /api/flashcards/:cardId/review - Revisar flashcard (protegido)

**Validações testadas:**
- Criar flashcard e associar ao deck (201)
- Verificar chave estrangeira (deck_id) no banco
- Listar flashcards do deck (200)
- Atualizar flashcard (200)
- Deletar flashcard (200)
- Processar revisão com qualidade válida (200)
- Validação de campos obrigatórios (400)
- Validação de quality fora do range (400)

### 4. Testes de Profile (`profile.integration.test.js`)
- ✅ GET /api/profile - Obter perfil (protegido)
- ✅ PUT /api/profile - Atualizar perfil (protegido)
- ✅ GET /api/profile/public/:username - Perfil público (público)
- ✅ GET /api/profile/leaderboard - Leaderboard (público)
- ✅ GET /api/profile/user/:username - Perfil por username (público)
- ✅ GET /api/profile/recent-activity - Atividade recente (protegido)
- ✅ POST /api/profile/onboarding-complete - Completar onboarding (protegido)

**Validações testadas:**
- Obter perfil autenticado (200)
- Atualizar perfil (200)
- Acessar perfil público (200)
- Acessar leaderboard (200)
- Rotas protegidas sem token (401)

### 5. Testes de Analytics (`analytics.integration.test.js`)
- ✅ GET /api/analytics/reviews-over-time - Revisões ao longo do tempo (protegido)
- ✅ GET /api/analytics/insights - Insights de performance (protegido)
- ✅ GET /api/analytics/summary - Resumo de analytics (protegido)
- ✅ GET /api/analytics/recent-activity - Atividade recente (protegido)

### 6. Testes de Achievements (`achievements.integration.test.js`)
- ✅ GET /api/achievements - Listar conquistas (protegido)
- ✅ POST /api/achievements/recalculate - Recalcular conquistas (protegido)
- ✅ POST /api/achievements/force-recalculate - Forçar recálculo (protegido)

### 7. Testes de Community (`community.integration.test.js`)
- ✅ GET /api/community/decks - Listar decks públicos (protegido)
- ✅ GET /api/community/decks/:deckId/view - Visualizar deck público (protegido)
- ✅ POST /api/community/decks/:deckId/clone - Clonar deck público (protegido)
- ✅ POST /api/community/decks/:deckId/rate - Avaliar deck (protegido)

### 8. Testes de Share (`share.integration.test.js`)
- ✅ GET /api/shared/:shareableId - Obter deck compartilhado (público)

### 9. Testes de Sinapse (`sinapse.integration.test.js`)
- ✅ POST /api/sinapse/conversations - Criar conversa (protegido)
- ✅ GET /api/sinapse/conversations - Listar conversas (protegido)
- ✅ POST /api/sinapse/conversations/:conversationId/messages - Enviar mensagem (protegido)
- ✅ GET /api/sinapse/conversations/:conversationId/messages - Listar mensagens (protegido)
- ✅ DELETE /api/sinapse/conversations/:conversationId - Deletar conversa (protegido)

## Helpers Disponíveis

### `createTestUser(email, password, username, fullName)`
Cria um usuário de teste no banco de dados e retorna um objeto com:
- `user`: objeto do usuário
- `session`: sessão do usuário
- `token`: token de acesso para autenticação

### `loginTestUser(email, password)`
Faz login de um usuário existente e retorna o token de acesso.

### `cleanupTestUser(userId)`
Limpa todos os dados de teste associados a um usuário:
- Flashcards
- Decks
- Conversas
- Perfil

**Nota**: A deleção do usuário do auth requer admin client e pode precisar ser feita manualmente.

## Exemplos de Uso

### Exemplo 1: Testar criação de deck
```javascript
it('deve criar um novo deck com sucesso', async () => {
  const response = await request(app)
    .post('/api/decks')
    .set('Authorization', `Bearer ${testUserToken}`)
    .send({
      title: 'Deck de Teste',
      description: 'Descrição do deck'
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
});
```

### Exemplo 2: Testar rota protegida sem token
```javascript
it('deve retornar erro 401 se token não for fornecido', async () => {
  const response = await request(app)
    .get('/api/decks');

  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty('error');
});
```

### Exemplo 3: Testar associação de flashcard ao deck
```javascript
it('deve criar flashcard e associá-lo ao deck', async () => {
  const response = await request(app)
    .post(`/api/decks/${testDeckId}/flashcards`)
    .set('Authorization', `Bearer ${testUserToken}`)
    .send({
      question: 'Pergunta?',
      answer: 'Resposta'
    });

  expect(response.status).toBe(201);
  expect(response.body.deck_id).toBe(testDeckId);
  
  // Verificar no banco
  const { data: flashcard } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', response.body.id)
    .single();
  
  expect(flashcard.deck_id).toBe(testDeckId);
});
```

## Notas Importantes

1. **Isolamento**: Cada teste cria seus próprios dados de teste e limpa após execução
2. **Tokens**: Tokens são gerados automaticamente para cada teste
3. **Banco de Dados**: Os testes fazem requisições reais ao banco de dados
4. **Timeout**: Os testes têm timeout de 30 segundos para acomodar operações de banco
5. **Limpeza**: Dados de teste são limpos automaticamente após cada teste

## Cobertura

Os testes de integração cobrem:
- ✅ Todos os endpoints principais da API
- ✅ Validação de autenticação (401, 403)
- ✅ Validação de entrada (400)
- ✅ Operações CRUD completas
- ✅ Associações entre entidades (chaves estrangeiras)
- ✅ Rotas públicas vs protegidas
- ✅ Fluxos de negócio completos

