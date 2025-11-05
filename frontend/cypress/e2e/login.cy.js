// /frontend/cypress/e2e/login.cy.js

describe('Fluxo de Login', () => {

  beforeEach(() => {
    cy.window().then((win) => {
      // Impede o banner de cookies de aparecer
      //
      win.localStorage.setItem('cookie_consent', 'true');
    });
    cy.visit('/login');
  });

  it('deve permitir que um usuário existente faça login com sucesso', () => {
    // (IDs baseados em frontend/src/pages/Login.jsx)
    cy.get('#email').type('m1r4sem@gmail.com'); // Use um usuário de teste real
    cy.get('#password').type('B23081979borges@'); // Use uma senha de teste real
    cy.get('button[type="submit"]').click();

    // (Baseado em frontend/src/App.jsx e frontend/src/pages/Dashboard.jsx)
    cy.url().should('include', '/dashboard');
    cy.get('.content-header h2').should('contain', 'Meus Baralhos');
  });

  it('deve mostrar uma mensagem de erro para credenciais inválidas', () => {
    cy.get('#email').type('usuario@errado.com');
    cy.get('#password').type('senhaerrada');
    cy.get('button[type="submit"]').click();

    // (Baseado em frontend/src/pages/Login.jsx)
    cy.get('.error-message').should('be.visible');

    // --- CORREÇÃO AQUI ---
    // Verificando o texto exato que aparece na sua imagem
    cy.get('.error-message').should('contain', 'Invalid login credentials');
    // --- FIM DA CORREÇÃO ---

    cy.url().should('not.include', '/dashboard');
  });
});
