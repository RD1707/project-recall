import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://khofqsjwyunicxdxapih.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob2Zxc2p3eXVuaWN4ZHhhcGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjM2NDksImV4cCI6MjA3MTY5OTY0OX0.3Fr8b6u3b6dqoh84qx0ulcddb-vj4gGqlOQvAI2weGE";

// Validar configurações
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Configurações do Supabase não encontradas');
}

// Configurações robustas para o cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Timeout para operações de autenticação
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'recall-react-app@1.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    timeout: 20000
  }
});

// Interceptador para logs e debugging em desenvolvimento
if (import.meta.env.DEV) {
  const originalFrom = supabase.from;
  supabase.from = function(table) {
    const query = originalFrom.call(this, table);
    const originalSelect = query.select;
    
    query.select = function(...args) {
      console.log(`[Supabase] SELECT from ${table}:`, args);
      return originalSelect.apply(this, args);
    };
    
    return query;
  };
}

// Função helper para lidar com erros de conexão
export const handleSupabaseError = (error, operation = 'operação') => {
  console.error(`Erro na ${operation}:`, error);
  
  if (error?.message?.includes('fetch')) {
    throw new Error('Problema de conexão. Verifique sua internet.');
  }
  
  if (error?.message?.includes('JWT')) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  
  if (error?.code === 'PGRST301') {
    throw new Error('Muitas solicitações. Tente novamente em alguns minutos.');
  }
  
  throw error;
};

// Função para testar conectividade
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Teste de conexão falhou:', error);
    return false;
  }
};