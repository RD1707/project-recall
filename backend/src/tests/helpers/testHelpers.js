const request = require('supertest');
const app = require('../../server');
const supabase = require('../../config/supabaseClient');

/**
 * Helper para criar um usuário de teste e obter token
 */
async function createTestUser(email, password, username, fullName) {
  try {
    // Criar usuário via Supabase
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || 'Test User',
          username: username || 'testuser',
        }
      }
    });

    if (signUpError) {
      // Se o usuário já existe, tentar fazer login
      if (signUpError.message.includes('already registered')) {
        const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (loginError || !sessionData.session) {
          throw new Error(`Erro ao fazer login do usuário existente: ${loginError?.message}`);
        }

        // Buscar dados do usuário
        const { data: { user } } = await supabase.auth.getUser(sessionData.session.access_token);
        
        return {
          user: user,
          session: sessionData.session,
          token: sessionData.session.access_token
        };
      }
      throw new Error(`Erro ao criar usuário de teste: ${signUpError.message}`);
    }

    if (!authData.user) {
      throw new Error('Usuário não foi criado corretamente');
    }

    // Obter sessão fazendo login
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError || !sessionData.session) {
      throw new Error(`Erro ao fazer login do usuário de teste: ${loginError?.message}`);
    }

    return {
      user: authData.user,
      session: sessionData.session,
      token: sessionData.session.access_token
    };
  } catch (error) {
    throw new Error(`Erro ao criar usuário de teste: ${error.message}`);
  }
}

/**
 * Helper para fazer login e obter token
 */
async function loginTestUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session) {
    throw new Error(`Erro ao fazer login: ${error?.message}`);
  }

  return data.session.access_token;
}

/**
 * Helper para limpar dados de teste
 */
async function cleanupTestUser(userId) {
  try {
    // Primeiro deletar flashcards relacionados aos decks do usuário
    const { data: decks } = await supabase
      .from('decks')
      .select('id')
      .eq('user_id', userId);
    
    if (decks && decks.length > 0) {
      const deckIds = decks.map(d => d.id);
      await supabase
        .from('flashcards')
        .delete()
        .in('deck_id', deckIds);
    }
    
    // Deletar decks
    await supabase
      .from('decks')
      .delete()
      .eq('user_id', userId);
    
    // Deletar outros dados relacionados
    await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);
    
    await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    // Nota: A deleção do usuário do auth requer admin client
    // Isso pode ser feito manualmente ou através de variáveis de ambiente de teste
  } catch (error) {
    console.error('Erro ao limpar usuário de teste:', error);
  }
}

module.exports = {
  createTestUser,
  loginTestUser,
  cleanupTestUser,
  app
};

