const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`Authentication failed: Missing or malformed authorization header`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl
      });
      return res.status(401).json({ 
        error: 'Acesso negado: token de autorização necessário.',
        code: 'AUTH_TOKEN_MISSING'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || token.length < 10) {
      logger.warn(`Authentication failed: Invalid token format`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl
      });
      return res.status(401).json({ 
        error: 'Acesso negado: token inválido.',
        code: 'AUTH_TOKEN_INVALID'
      });
    }

    // Timeout para operações de autenticação
    const authPromise = supabase.auth.getUser(token);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    );

    const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise]);
    
    if (error) {
      logger.warn(`Authentication failed: Supabase error`, {
        error: error.message,
        ip: req.ip,
        endpoint: req.originalUrl
      });
      
      if (error.message.includes('expired')) {
        return res.status(401).json({ 
          error: 'Token expirado. Faça login novamente.',
          code: 'AUTH_TOKEN_EXPIRED'
        });
      }
      
      return res.status(403).json({ 
        error: 'Token inválido ou corrompido.',
        code: 'AUTH_TOKEN_INVALID'
      });
    }

    if (!user || !user.id) {
      logger.warn(`Authentication failed: No user data returned`, {
        ip: req.ip,
        endpoint: req.originalUrl
      });
      return res.status(403).json({ 
        error: 'Dados de usuário inválidos.',
        code: 'AUTH_USER_INVALID'
      });
    }

    // Verificar se o usuário não foi desabilitado/banido
    if (user.banned_until && new Date(user.banned_until) > new Date()) {
      logger.warn(`Banned user attempted access`, {
        userId: user.id,
        bannedUntil: user.banned_until,
        ip: req.ip
      });
      return res.status(403).json({ 
        error: 'Conta temporariamente suspensa.',
        code: 'AUTH_USER_BANNED'
      });
    }

    req.user = user;
    req.authToken = token;
    
    // Log successful authentication (sem dados sensíveis)
    logger.debug(`User authenticated successfully`, {
      userId: user.id,
      endpoint: req.originalUrl,
      method: req.method
    });
    
    next();
  } catch (error) {
    logger.error(`Authentication middleware error: ${error.message}`, {
      stack: error.stack,
      ip: req.ip,
      endpoint: req.originalUrl,
      userAgent: req.get('User-Agent')
    });
    
    if (error.message === 'Auth timeout') {
      return res.status(408).json({ 
        error: 'Tempo limite para autenticação esgotado.',
        code: 'AUTH_TIMEOUT'
      });
    }
    
    return res.status(500).json({ 
      error: 'Erro interno de autenticação.',
      code: 'AUTH_INTERNAL_ERROR'
    });
  }
};

module.exports = {
  authenticateToken
};