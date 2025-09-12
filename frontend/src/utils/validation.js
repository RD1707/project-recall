import { VALIDATION, CONTENT_LIMITS } from '../constants';

/**
 * Utilitários de validação para o frontend
 */

// Validadores básicos
export const validators = {
  /**
   * Valida se o email tem formato válido
   * @param {string} email 
   * @returns {boolean}
   */
  isValidEmail: (email) => {
    if (!email || typeof email !== 'string') return false;
    return VALIDATION.EMAIL_REGEX.test(email.trim());
  },

  /**
   * Valida se a senha atende aos critérios mínimos
   * @param {string} password 
   * @returns {boolean}
   */
  isValidPassword: (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
  },

  /**
   * Valida se o username é válido
   * @param {string} username 
   * @returns {boolean}
   */
  isValidUsername: (username) => {
    if (!username || typeof username !== 'string') return false;
    const trimmed = username.trim();
    return trimmed.length >= VALIDATION.USERNAME_MIN_LENGTH && 
           trimmed.length <= CONTENT_LIMITS.USERNAME_MAX;
  },

  /**
   * Valida se o título do deck é válido
   * @param {string} title 
   * @returns {boolean}
   */
  isValidDeckTitle: (title) => {
    if (!title || typeof title !== 'string') return false;
    const trimmed = title.trim();
    return trimmed.length >= VALIDATION.DECK_TITLE_MIN_LENGTH && 
           trimmed.length <= CONTENT_LIMITS.DECK_TITLE_MAX;
  },

  /**
   * Valida se o UUID é válido
   * @param {string} uuid 
   * @returns {boolean}
   */
  isValidUUID: (uuid) => {
    if (!uuid || typeof uuid !== 'string') return false;
    return VALIDATION.UUID_REGEX.test(uuid);
  },

  /**
   * Valida se o ID compartilhável é válido
   * @param {string} shareableId 
   * @returns {boolean}
   */
  isValidShareableId: (shareableId) => {
    if (!shareableId || typeof shareableId !== 'string') return false;
    return VALIDATION.SHAREABLE_ID_REGEX.test(shareableId);
  },

  /**
   * Valida se o rating é válido (1-5)
   * @param {number} rating 
   * @returns {boolean}
   */
  isValidRating: (rating) => {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
  },

  /**
   * Valida se a cor hexadecimal é válida
   * @param {string} color 
   * @returns {boolean}
   */
  isValidColor: (color) => {
    if (!color || typeof color !== 'string') return false;
    return /^#[0-9A-F]{6}$/i.test(color);
  }
};

// Sanitizadores
export const sanitizers = {
  /**
   * Sanitiza texto removendo caracteres perigosos
   * @param {string} text 
   * @param {number} maxLength 
   * @returns {string}
   */
  sanitizeText: (text, maxLength = 1000) => {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '') // Remove basic HTML chars
      .replace(/\s+/g, ' '); // Normalize whitespace
  },

  /**
   * Sanitiza email
   * @param {string} email 
   * @returns {string}
   */
  sanitizeEmail: (email) => {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
  },

  /**
   * Sanitiza username
   * @param {string} username 
   * @returns {string}
   */
  sanitizeUsername: (username) => {
    if (!username || typeof username !== 'string') return '';
    return username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, CONTENT_LIMITS.USERNAME_MAX);
  },

  /**
   * Sanitiza parâmetros de busca
   * @param {string} searchTerm 
   * @returns {string}
   */
  sanitizeSearchTerm: (searchTerm) => {
    if (!searchTerm || typeof searchTerm !== 'string') return '';
    return searchTerm
      .trim()
      .slice(0, CONTENT_LIMITS.SEARCH_TERM_MAX)
      .replace(/[<>'"]/g, '');
  }
};

// Validadores de formulário com mensagens
export const formValidators = {
  /**
   * Valida campo de email com mensagem de erro
   * @param {string} email 
   * @returns {object}
   */
  validateEmailField: (email) => {
    const sanitized = sanitizers.sanitizeEmail(email);
    
    if (!sanitized) {
      return { isValid: false, message: 'Email é obrigatório' };
    }
    
    if (!validators.isValidEmail(sanitized)) {
      return { isValid: false, message: 'Email deve ter um formato válido' };
    }
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida campo de senha com mensagem de erro
   * @param {string} password 
   * @returns {object}
   */
  validatePasswordField: (password) => {
    if (!password) {
      return { isValid: false, message: 'Senha é obrigatória' };
    }
    
    if (!validators.isValidPassword(password)) {
      return { isValid: false, message: `Senha deve ter pelo menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres` };
    }
    
    return { isValid: true };
  },

  /**
   * Valida campo de confirmação de senha
   * @param {string} password 
   * @param {string} confirmPassword 
   * @returns {object}
   */
  validatePasswordConfirmation: (password, confirmPassword) => {
    if (!confirmPassword) {
      return { isValid: false, message: 'Confirmação de senha é obrigatória' };
    }
    
    if (password !== confirmPassword) {
      return { isValid: false, message: 'Senhas não coincidem' };
    }
    
    return { isValid: true };
  },

  /**
   * Valida campo de username
   * @param {string} username 
   * @returns {object}
   */
  validateUsernameField: (username) => {
    const sanitized = sanitizers.sanitizeUsername(username);
    
    if (!sanitized) {
      return { isValid: false, message: 'Nome de usuário é obrigatório' };
    }
    
    if (!validators.isValidUsername(sanitized)) {
      return { 
        isValid: false, 
        message: `Nome de usuário deve ter entre ${VALIDATION.USERNAME_MIN_LENGTH} e ${CONTENT_LIMITS.USERNAME_MAX} caracteres`
      };
    }
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida campo de título de deck
   * @param {string} title 
   * @returns {object}
   */
  validateDeckTitleField: (title) => {
    const sanitized = sanitizers.sanitizeText(title, CONTENT_LIMITS.DECK_TITLE_MAX);
    
    if (!sanitized) {
      return { isValid: false, message: 'Título é obrigatório' };
    }
    
    if (!validators.isValidDeckTitle(sanitized)) {
      return { 
        isValid: false, 
        message: `Título deve ter entre ${VALIDATION.DECK_TITLE_MIN_LENGTH} e ${CONTENT_LIMITS.DECK_TITLE_MAX} caracteres`
      };
    }
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida campo de descrição de deck
   * @param {string} description 
   * @returns {object}
   */
  validateDeckDescriptionField: (description) => {
    if (!description) {
      return { isValid: true, sanitized: '' }; // Descrição é opcional
    }
    
    const sanitized = sanitizers.sanitizeText(description, CONTENT_LIMITS.DECK_DESCRIPTION_MAX);
    
    if (sanitized.length > CONTENT_LIMITS.DECK_DESCRIPTION_MAX) {
      return { 
        isValid: false, 
        message: `Descrição não pode ter mais de ${CONTENT_LIMITS.DECK_DESCRIPTION_MAX} caracteres`
      };
    }
    
    return { isValid: true, sanitized };
  }
};

// Utilitário para validar formulário completo
export const validateForm = (fields, validators) => {
  const errors = {};
  const sanitized = {};
  let isValid = true;

  Object.keys(fields).forEach(fieldName => {
    const validator = validators[fieldName];
    if (validator) {
      const result = validator(fields[fieldName]);
      if (!result.isValid) {
        errors[fieldName] = result.message;
        isValid = false;
      } else if (result.sanitized !== undefined) {
        sanitized[fieldName] = result.sanitized;
      }
    }
  });

  return { isValid, errors, sanitized };
};

export default {
  validators,
  sanitizers,
  formValidators,
  validateForm
};