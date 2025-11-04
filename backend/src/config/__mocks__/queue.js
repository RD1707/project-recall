const mockQueue = {
  add: jest.fn(() => Promise.resolve()),
  on: jest.fn(),
  close: jest.fn(() => Promise.resolve()),
};

module.exports = {
  flashcardGenerationQueue: mockQueue,
  connection: null,
  isRedisConnected: false, // Importante: Isso força os controllers a usar a rota síncrona
};