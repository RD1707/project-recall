const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const signup = async (req, res) => {
  const { email, password, full_name, username } = req.body;

  if (!email || !password || !full_name || !username) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.', type: 'VALIDATION_ERROR' });
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Usuário deve ter 3-20 caracteres (letras, números ou _).', field: 'username', type: 'FIELD_ERROR' });
  }

  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError; 
    if (existingUser) {
      return res.status(400).json({ error: 'Este nome de usuário já está em uso.', field: 'username', type: 'FIELD_ERROR' });
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name.trim(),
          username: username.trim(),
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado.', field: 'email', type: 'FIELD_ERROR' });
      }
      throw signUpError;
    }

    if (!authData.user) {
        return res.status(400).json({ error: 'Falha ao criar usuário. Verifique se o email já está cadastrado.' });
    }
    
    logger.info(`Usuário ${authData.user.id} registrado com sucesso.`);

    res.status(201).json({
      message: 'Usuário registrado com sucesso! Verifique seu email para confirmação.',
      user: authData.user
    });

  } catch (err) {
    logger.error(`Erro inesperado no signup: ${err.message}`);
    res.status(500).json({
      error: 'Erro interno do servidor ao criar conta.',
      details: err.message
    });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      logger.warn(`Tentativa de login falhou para ${email}: ${error.message}`);
      return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
    }

    if (!data.session) {
      return res.status(400).json({ error: 'Falha ao criar sessão.' });
    }
    
    res.status(200).json({
      message: 'Login bem-sucedido!',
      session: data.session,
      user: data.user
    });
  } catch (err) {
    logger.error(`Erro inesperado no login: ${err.message}`);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const completeGoogleProfile = async (req, res) => {
    const userId = req.user.id; 
    const { fullName, username } = req.body; 

    if (!userId || !fullName || !username) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.status(400).json({ error: 'Usuário deve ter 3-20 caracteres (letras, números ou _).', field: 'username', type: 'FIELD_ERROR' });
    }

    try {
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .neq('id', userId)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Este nome de usuário já está em uso.', field: 'username', type: 'FIELD_ERROR' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({ full_name: fullName.trim(), username: username.trim() })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        
        res.status(200).json({ message: 'Perfil completado com sucesso!', profile: data });

    } catch (err) {
        logger.error(`Erro ao completar perfil Google para ${userId}: ${err.message}`);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

module.exports = {
  signup,
  login,
  completeGoogleProfile,
};