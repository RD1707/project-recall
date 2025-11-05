/// <reference types="cypress" />

/**
 * @file cypress/e2e/ai-generation.cy.js
 * @description Testa o fluxo de geração de flashcards por IA e a edição subsequente.
 * (Versão corrigida com scrollIntoView)
 */

describe('Funcionalidade de Geração de Flashcards por IA', () => {
  // --- DADOS DO TESTE ---
  const DECK_NAME = 'Teste'; // O nome do baralho que DEVE existir
  const AI_PROMPT = 'O que é o ciclo da água? Explique evaporação, condensação e precipitação.';
  const EDIT_QUESTION = 'PERGUNTA EDITADA PELO CYPRESS';
  const EDIT_ANSWER = 'RESPOSTA EDITADA PELO CYPRESS';

  beforeEach(() => {
    /**
     * Etapa de Setup
     */

    // 1. Define o cookie de consentimento no localStorage
    // (baseado em frontend/src/components/common/CookieBanner.jsx)
    const cookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie_consent', JSON.stringify(cookieConsent));

    // 2. Realiza o login manualmente
    cy.visit('/login');

    // (baseado em frontend/src/pages/Login.jsx)
    cy.get('input#email').type('painpassinho@gmail.com');
    cy.get('input#password').type('B123456');
    cy.get('button[type="submit"]').contains('Entrar').click();

    /**
     * 3. Espera o login ser bem-sucedido e os decks carregarem
     */
    
    // Verifica o redirecionamento para o dashboard
    cy.url().should('include', '/dashboard'); 

    // Espera os skeletons de carregamento desaparecerem
    // (baseado em frontend/src/pages/Dashboard.jsx)
    cy.get('.skeleton-deck', { timeout: 15000 }).should('not.exist');

    // Garante que o grid de decks esteja visível
    cy.get('#decks-grid').should('be.visible');
  });

  it('deve gerar 2 flashcards por IA e permitir a edição do primeiro gerado', () => {
    
    // 1. Encontra e clica no deck "Teste"
    // (baseado em frontend/src/components/decks/DeckCard.jsx)
    cy.get('.deck-card__header h3').contains(DECK_NAME).click();

    // 2. Espera a página do deck carregar
    // (baseado em frontend/src/pages/DeckDetail.jsx)
    cy.get('.loading-container', { timeout: 15000 }).should('not.exist');
    cy.get('#deck-title-heading').should('contain.text', DECK_NAME);

    // 3. Interage com o Gerador de IA (baseado em frontend/src/components/decks/AIGenerator.jsx)
    
    // --- CORREÇÃO APLICADA AQUI ---
    // Rola a tela até o painel de IA para garantir que o textarea esteja visível
    cy.get('aside.ai-generator-section textarea#text')
      .scrollIntoView() // Garante que o elemento está na tela
      .should('be.visible') // Agora essa verificação vai passar
      .type(AI_PROMPT);
    // --- FIM DA CORREÇÃO ---

    // 4. Diminui o contador de 5 para 2 (clica 3 vezes no botão de diminuir)
    const decreaseButton = cy.get('aside.ai-generator-section button[aria-label="Diminuir quantidade"]');
    decreaseButton.click();
    decreaseButton.click();
    decreaseButton.click();

    // Verifica se o valor do input agora é "2"
    cy.get('aside.ai-generator-section input#count-input').should('have.value', '2');

    // 5. Clica para gerar os flashcards
    cy.get('aside.ai-generator-section form.generator-form button[type="submit"]').click();

    /**
     * 6. ESPERA PELA GERAÇÃO (Ação Assíncrona)
     *
     * Espera pelo toast de sucesso que o DeckDetail.jsx dispara
     * após o polling de geração de IA ser concluído.
     */
    cy.contains('novo(s) card(s) adicionado(s)!', { timeout: 30000 }).should('be.visible');

    // 7. Edita o primeiro card gerado (que será o ÚLTIMO da lista)
    
    // Pega o último card da lista
    cy.get('.flashcards-grid .flashcard-item')
      .last()
      .as('primeiroCardGerado'); // Salva uma referência a ele

    // Clica no botão de editar (que só aparece no hover, por isso usamos force: true)
    // (baseado em frontend/src/pages/DeckDetail.jsx -> FlashcardItem)
    cy.get('@primeiroCardGerado')
      .find('button[title="Editar Card"]')
      .click({ force: true });

    // 8. Interage com o modal de edição
    cy.get('.modal-header h2').should('contain.text', 'Editar Flashcard');
    
    // Limpa os campos e digita o novo conteúdo
    cy.get('form#card-form textarea#question')
      .clear()
      .type(EDIT_QUESTION);
      
    cy.get('form#card-form textarea#answer')
      .clear()
      .type(EDIT_ANSWER);

    // Salva a edição
    cy.get('form#card-form .modal-footer button[type="submit"]').click();

    // 9. Verifica se o modal fechou e o conteúdo foi atualizado
    cy.get('.modal-header').should('not.exist');
    
    // Verifica o texto no card que editamos
    cy.get('@primeiroCardGerado')
      .find('.flashcard-question')
      .should('contain.text', EDIT_QUESTION);
      
    cy.get('@primeiroCardGerado')
      .find('.flashcard-answer')
      .should('contain.text', EDIT_ANSWER);
  });
});