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

    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/email-verification/confirm?verified=true`;

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name.trim(),
          username: username.trim(),
        },
        emailRedirectTo: redirectUrl
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

        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single();

        const avatarUrl = currentProfile?.avatar_url ||
                         req.user?.user_metadata?.avatar_url ||
                         req.user?.user_metadata?.picture ||
                         null;

        const { data, error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName.trim(),
                username: username.trim(),
                avatar_url: avatarUrl
            })
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

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Por favor, insira um e-mail válido.' });
    }

    try {
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`;
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        });

        if (error) {
            logger.error(`Erro ao enviar email de recuperação para ${email}: ${error.message}`);
        }

        res.status(200).json({ 
            message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.' 
        });

    } catch (err) {
        logger.error(`Erro inesperado no forgot password: ${err.message}`);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

const resetPassword = async (req, res) => {
    const { access_token, refresh_token, password } = req.body;

    if (!access_token || !password) {
        return res.status(400).json({ error: 'Token de acesso e senha são obrigatórios.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    try {
        logger.info(`Tentativa de reset de senha com token: ${access_token.substring(0, 10)}...`);

        const { createClient } = require('@supabase/supabase-js');
        const resetClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        const { data: sessionData, error: sessionError } = await resetClient.auth.setSession({
            access_token,
            refresh_token: refresh_token || null
        });

        if (sessionError) {
            logger.error(`Erro ao definir sessão: ${sessionError.message}`);
            return res.status(400).json({ error: 'Token de recuperação inválido ou expirado.' });
        }

        if (!sessionData.user) {
            logger.error('Usuário não encontrado após definir sessão');
            return res.status(400).json({ error: 'Token de recuperação inválido.' });
        }

        logger.info(`Usuário autenticado: ${sessionData.user.id}`);

        const { error: updateError } = await resetClient.auth.updateUser({
            password: password
        });

        if (updateError) {
            logger.error(`Erro ao atualizar senha: ${updateError.message}`);
            return res.status(400).json({ error: 'Falha ao redefinir a senha.' });
        }

        logger.info('Senha redefinida com sucesso');
        res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (err) {
        logger.error(`Erro inesperado no reset password: ${err.message}`);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

const ensureUserProfile = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
        const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (!existingProfile) {
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    full_name: req.user.user_metadata?.full_name || null,
                    avatar_url: req.user.user_metadata?.avatar_url || req.user.user_metadata?.picture || null,
                    points: 0,
                    current_streak: 0,
                    max_streak: 0,
                    weekly_points: 0,
                    has_completed_onboarding: false
                })
                .select()
                .single();

            if (createError) {
                throw createError;
            }

            logger.info(`Perfil criado automaticamente para usuário OAuth: ${userId}`);
            return res.status(201).json({ profile: newProfile, isNew: true });
        }

        res.status(200).json({ profile: existingProfile, isNew: false });

    } catch (err) {
        logger.error(`Erro ao garantir perfil do usuário ${userId}: ${err.message}`);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

module.exports = {
  signup,
  login,
  completeGoogleProfile,
  forgotPassword,
  resetPassword,
  ensureUserProfile,
};