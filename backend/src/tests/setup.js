/**
 * Setup global para testes de integração
 * Este arquivo é executado antes de todos os testes
 */

// Configurar timeout para testes de integração (podem ser mais lentos)
jest.setTimeout(30000); // 30 segundos

// Suprimir logs durante os testes (opcional, pode ser comentado para debug)
if (process.env.SUPPRESS_TEST_LOGS === 'true') {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  global.console.log = jest.fn();
  global.console.error = jest.fn();
  global.console.warn = jest.fn();

  // Restaurar console após todos os testes
  afterAll(() => {
    global.console.log = originalConsoleLog;
    global.console.error = originalConsoleError;
    global.console.warn = originalConsoleWarn;
  });
}

