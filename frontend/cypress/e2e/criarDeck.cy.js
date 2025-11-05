/// <reference types="cypress" />

/**
 * @file cypress/e2e/deck-creation.cy.js
 * @description Teste funcional para o fluxo completo de criação e exclusão de um baralho,
 * incluindo login manual.
 */

describe('Funcionalidade de Criação de Baralhos', () => {
  // Usamos dados dinâmicos para garantir que o teste seja único a cada execução
  const deckTitle = `Baralho de Teste Cypress - ${Date.now()}`;
  const deckDesc = 'Descrição automática gerada pelo teste funcional.';

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

    // Seleciona os campos com base nos IDs em frontend/src/pages/Login.jsx
    cy.get('input#email').type('painpassinho@gmail.com');
    cy.get('input#password').type('B123456');
    cy.get('button[type="submit"]').contains('Entrar').click();

    /**
     * 3. Espera o login ser bem-sucedido e os decks carregarem
     */
    
    // Verifica se fomos redirecionados para o dashboard
    cy.url().should('include', '/dashboard'); 

    // Espera até que os skeletons de carregamento (classe .skeleton-deck) desapareçam.
    // Isso garante que a chamada à API (fetchDecks) terminou.
    // Aumentamos o timeout para 15s para chamadas de API mais lentas.
    // (baseado em frontend/src/pages/Dashboard.jsx)
    cy.get('.skeleton-deck', { timeout: 15000 }).should('not.exist');

    // Garante que o grid principal ou o estado de vazio esteja visível
    // (baseado em frontend/src/pages/Dashboard.jsx)
    cy.get('#decks-grid, #empty-state').should('be.visible');
  });

  it('deve permitir ao usuário criar um novo baralho e depois excluí-lo', () => {
    cy.wait(4000);
    // --- ETAPA DE CRIAÇÃO ---

    // 1. Clica no botão "Novo Baralho" (ID de Dashboard.jsx)
    cy.get('#create-deck-btn').click();

    // 2. Verifica se o modal de criação abriu
    // (baseado no frontend/src/pages/Dashboard.jsx)
    cy.get('.modal-header h2').should('contain.text', 'Criar Novo Baralho');

    // 3. Preenche o formulário (IDs de DeckForm em Dashboard.jsx)
    cy.get('form#deck-form input#title').type(deckTitle);
    cy.get('form#deck-form textarea#description').type(deckDesc);
    
    // 4. Seleciona a segunda cor da lista
    cy.get('form#deck-form .color-option').eq(1).click();

    // 5. Submete o formulário
    cy.get('form#deck-form').submit();

    // 6. Verifica se o modal fechou
    cy.get('.modal-header').should('not.exist');

    // 7. Verifica se o novo baralho apareceu no grid
    // (baseado em frontend/src/components/decks/DeckCard.jsx)
    cy.get('#decks-grid', { timeout: 5000 }).should('be.visible');
    
    cy.get('.deck-card__header h3')
      .contains(deckTitle)
      .should('be.visible');
    
    cy.get('.deck-card__body p')
      .contains(deckDesc)
      .should('be.visible');

      
    // --- ETAPA DE LIMPEZA (CLEANUP) ---

    // 8. Encontra o card recém-criado e clica no botão de opções
    // (classe .deck-card__options-btn de DeckCard.jsx)
    cy.get('.deck-card__header h3')
      .contains(deckTitle)
      .closest('.deck-card') // Encontra o componente pai .deck-card
      .find('.deck-card__options-btn') // Encontra o botão de opções
      .click();

    // 9. Verifica se o modal de EDIÇÃO abriu
    cy.get('.modal-header h2').should('contain.text', 'Editar Baralho');

    // 10. Clica no botão de excluir (classe .btn-danger de Dashboard.jsx)
    cy.get('.modal-footer-actions .btn-danger').contains('Excluir').click();

    /**
     * 11. Confirmação de Exclusão
     * O Dashboard.jsx usa window.confirm(). O Cypress lida com isso
     * automaticamente por padrão, clicando em "OK".
     */

    // 12. Verifica se o modal de edição fechou após a exclusão
    cy.get('.modal-header').should('not.exist');

    // 13. Verifica se o baralho foi removido do dashboard
    cy.get('body').should('not.contain.text', deckTitle);
  });
});