// /frontend/cypress.config.js

import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173/",
    
    // --- ADICIONE ESTAS LINHAS ---
    viewportHeight: 900, // Aumenta a altura (padrão é 660)
    viewportWidth: 1200,  // Aumenta a largura (padrão é 1000)
    // --- FIM DA ADIÇÃO ---

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});