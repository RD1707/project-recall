module.exports = {
  testEnvironment: 'node',
  verbose: true,
  // Limpa os mocks entre os testes para que não interfiram uns nos outros
  clearMocks: true, 
  // Ignora o worker de fila, que não precisa ser testado unitariamente aqui
  testPathIgnorePatterns: ['/node_modules/', '/backend/src/worker.js'], 
  forceExit: true,
  // Setup para testes de integração
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  // Padrões para identificar testes
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
    '**/integration/**/*.test.js'
  ],
};