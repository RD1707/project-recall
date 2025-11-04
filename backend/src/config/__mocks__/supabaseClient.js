// backend/__mocks__/supabaseClient.js

// ***** INÍCIO DA CORREÇÃO 1: Mover esta linha para o topo *****
const originalSelect = jest.fn(function() { return this; });
// ***************************************************************

const supabase = {
  data: null,
  error: null,
  count: null,

  // Funções de encadeamento
  from: jest.fn(function() { return this; }),
  insert: jest.fn(function() { return this; }),
  update: jest.fn(function() { return this; }),
  delete: jest.fn(function() { return this; }),
  eq: jest.fn(function() { return this; }),
  neq: jest.fn(function() { return this; }),
  gt: jest.fn(function() { return this; }),
  in: jest.fn(function() { return this; }),
  or: jest.fn(function() { return this; }),
  order: jest.fn(function() { return this; }),
  limit: jest.fn(function() { return this; }),
  range: jest.fn(function() { return this; }),

  // Funções que terminam o encadeamento
  single: jest.fn(() => ({ data: supabase.data, error: supabase.error })),
  rpc: jest.fn(() => ({ data: supabase.data, error: supabase.error })),

  // Mock do Auth
  auth: {
    signUp: jest.fn(() => ({ data: { user: supabase.data }, error: supabase.error })),
    signInWithPassword: jest.fn(() => ({ data: { session: supabase.data, user: supabase.data }, error: supabase.error })),
    updateUser: jest.fn(() => ({ data: { user: supabase.data }, error: supabase.error })),
    getUser: jest.fn(() => ({ data: { user: supabase.data }, error: supabase.error })),
    admin: {
      deleteUser: jest.fn(() => ({ data: supabase.data, error: supabase.error })),
    },
  },
  
  // Mock do Storage
  storage: {
    from: jest.fn(function() { return this; }), 
    upload: jest.fn(() => ({ data: supabase.data, error: supabase.error })),
    getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'http://mock.url/avatar.png' } })),
  },

  // Funções de controle do Teste
  __setMockData: (data) => {
    supabase.data = data;
    supabase.error = null;
  },
  __setMockError: (error) => {
    supabase.data = null;
    supabase.error = error;
  },
  __setMockCount: (count) => {
    supabase.count = count;
  },

  __resetMocks: () => {
    supabase.data = null;
    supabase.error = null;
    supabase.count = null;
    
    jest.clearAllMocks();

    // Limpa implementações (mockImplementationOnce) em fila
    supabase.single.mockClear();
    supabase.insert.mockClear();
    supabase.update.mockClear();
    supabase.delete.mockClear();
    supabase.rpc.mockClear();
    supabase.auth.signUp.mockClear();
    supabase.auth.signInWithPassword.mockClear();
    supabase.auth.updateUser.mockClear();
    supabase.auth.getUser.mockClear();
    supabase.auth.admin.deleteUser.mockClear();
    supabase.storage.from.mockClear();
    supabase.storage.upload.mockClear();
    supabase.storage.getPublicUrl.mockClear();
    supabase.select.mockClear(); 
    
    // Agora 'originalSelect' está no escopo e será limpo
    if (originalSelect) {
      originalSelect.mockClear();
    }
  },
};

// Sobrescrevemos o mock 'select'
supabase.select = jest.fn((selector, options) => {
  // Se for uma chamada de 'count'
  if (options && options.count === 'exact' && options.head === true) {
    // Retorna um objeto que tem .eq() e que retorna o count
    return {
      eq: jest.fn(() => ({ count: supabase.count, error: supabase.error, data: null }))
    };
  }
  // Para todas as outras chamadas .select(), retorna 'this' (supabase)
  return originalSelect.call(supabase, selector, options); 
});

module.exports = supabase;