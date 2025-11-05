/// <reference types="cypress" />

/**
 * @file cypress/e2e/study-session.cy.js
 * @description Testa o fluxo principal de uma sessão de estudo,
 * incluindo virar cards e avaliar o desempenho.
 */

describe('Funcionalidade de Sessão de Estudo', () => {
  // --- DADOS DO TESTE ---
  const DECK_NAME = 'Teste 2'; // O nome do baralho que DEVE existir

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

  it('deve permitir ao usuário estudar um baralho e avaliar os cards', () => {
    
    // 1. Encontra e clica no deck "Teste 2"
    // (baseado em frontend/src/components/decks/DeckCard.jsx)
    cy.get('.deck-card__header h3').contains(DECK_NAME).click();

    // 2. Espera a página do deck carregar
    // (baseado em frontend/src/pages/DeckDetail.jsx)
    cy.get('.loading-container', { timeout: 15000 }).should('not.exist');
    cy.get('#deck-title-heading').should('contain.text', DECK_NAME);

    // 3. Espera 2.5 segundos (conforme solicitado)
    cy.wait(2500);

    // 4. Clica no botão "Estudar Sozinho"
    // (baseado em frontend/src/pages/DeckDetail.jsx)
    cy.get('.btn-primary').contains('Estudar Sozinho').click();

    // 5. Espera a página de estudo carregar
    // (baseado em frontend/src/pages/StudySession.jsx)
    cy.url().should('include', '/study/');
    
    // Espera a tela de loading da sessão desaparecer
    cy.get('.state-container.loading-state', { timeout: 15000 }).should('not.exist');
    
    // Espera o primeiro card (botão de virar) estar visível
    cy.get('.flip-btn', { timeout: 10000 }).should('be.visible');

    // --- CARD 1: FÁCIL ---

    // 6. Espera 1 segundo (conforme solicitado)
    cy.wait(1000);

    // 7. Aperta Espaço para virar o card
    // (O listener está no 'window' em StudySession.jsx, então 'body' funciona)
    cy.get('body').type(' ');

    // 8. Espera os botões de avaliação aparecerem
    cy.get('.quality-buttons', { timeout: 5000 }).should('be.visible');

    // 9. Clica em "Fácil"
    // (Selector baseado em StudySession.jsx)
    cy.get('.quality-btn[data-feedback="easy"]').click();

    // --- CARD 2: ERREI ---

    // 10. Espera 2 segundos (conforme solicitado)
    cy.wait(2000);

    // 11. Espera o próximo card estar pronto (botão de virar visível)
    cy.get('.flip-btn', { timeout: 10000 }).should('be.visible');
    
    // 12. Aperta Espaço para virar o card
    cy.get('body').type(' ');

    // 13. Espera os botões de avaliação aparecerem
    cy.get('.quality-buttons', { timeout: 5000 }).should('be.visible');

    // 14. Clica em "Errei"
    cy.get('.quality-btn[data-feedback="again"]').click();

    // --- CARD 3: BOM ---

    // 15. Espera 2 segundos (conforme solicitado)
    cy.wait(2000);

    // 16. Espera o próximo card estar pronto
    cy.get('.flip-btn', { timeout: 10000 }).should('be.visible');

    // 17. Aperta Espaço para virar o card
    cy.get('body').type(' ');

    // 18. Espera os botões de avaliação aparecerem
    cy.get('.quality-buttons', { timeout: 5000 }).should('be.visible');

    // 19. Clica em "Bom"
    cy.get('.quality-btn[data-feedback="good"]').click();

    // 20. O teste termina, confirmando que o fluxo foi concluído
    cy.log('Sessão de estudo com 3 cards avaliados concluída.');
  });
});