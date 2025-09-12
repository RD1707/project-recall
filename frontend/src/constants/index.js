// Constantes da aplicação

// Timeouts (em milissegundos)
export const TIMEOUTS = {
  API_REQUEST: 10000,
  AUTH_CHECK: 5000,
  FILE_UPLOAD: 30000,
  CLONE_OPERATION: 15000,
};

// Limites de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_PAGE_NUMBER: 1000,
};

// Limites de conteúdo
export const CONTENT_LIMITS = {
  DECK_TITLE_MAX: 100,
  DECK_DESCRIPTION_MAX: 500,
  CARD_TEXT_MAX: 1000,
  USERNAME_MAX: 50,
  SEARCH_TERM_MAX: 100,
  MAX_CARDS_PER_DECK: 1000,
  MAX_OPTIONS_PER_CARD: 6,
};

// Rate limiting
export const RATE_LIMITS = {
  CLONE_ATTEMPTS_PER_HOUR: 10,
  RATING_ATTEMPTS_PER_HOUR: 20,
  GENERAL_REQUESTS_PER_15MIN: 100,
  SHARE_REQUESTS_PER_15MIN: 200,
};

// Configurações de estudo
export const STUDY_CONFIG = {
  DEFAULT_EASE_FACTOR: 2.5,
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 4.0,
  INITIAL_INTERVAL: 1,
  GRADUATION_INTERVAL: 4,
};

// Configurações de UI
export const UI_CONFIG = {
  TOAST_DURATION_SUCCESS: 3000,
  TOAST_DURATION_ERROR: 5000,
  TOAST_DURATION_WARNING: 4000,
  DEBOUNCE_SEARCH: 500,
  INFINITE_SCROLL_THRESHOLD: 100,
};

// URLs de API
export const API_ENDPOINTS = {
  BASE: '/api',
  AUTH: '/api/auth',
  DECKS: '/api/decks',
  FLASHCARDS: '/api/flashcards',
  COMMUNITY: '/api/community',
  PROFILE: '/api/profile',
  ANALYTICS: '/api/analytics',
  ACHIEVEMENTS: '/api/achievements',
  SHARED: '/api/shared',
};

// Status HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Mensagens padrão
export const MESSAGES = {
  SUCCESS: {
    DECK_CREATED: 'Baralho criado com sucesso!',
    DECK_UPDATED: 'Baralho atualizado com sucesso!',
    DECK_DELETED: 'Baralho excluído com sucesso!',
    DECK_CLONED: 'Baralho clonado com sucesso!',
    CARD_CREATED: 'Card criado com sucesso!',
    CARD_UPDATED: 'Card atualizado com sucesso!',
    CARD_DELETED: 'Card excluído com sucesso!',
    RATING_SUBMITTED: 'Avaliação registrada com sucesso!',
    PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
  },
  ERROR: {
    NETWORK: 'Problema de conexão. Verifique sua internet.',
    AUTH_EXPIRED: 'Sua sessão expirou. Faça login novamente.',
    PERMISSION_DENIED: 'Você não tem permissão para esta ação.',
    NOT_FOUND: 'Recurso não encontrado.',
    RATE_LIMITED: 'Muitas solicitações. Tente novamente mais tarde.',
    SERVER_ERROR: 'Erro interno do servidor. Tente novamente.',
    VALIDATION: 'Dados inválidos fornecidos.',
    TIMEOUT: 'Tempo limite esgotado. Tente novamente.',
    GENERIC: 'Algo deu errado. Tente novamente.',
  },
  LOADING: {
    AUTHENTICATING: 'Verificando autenticação...',
    LOADING_DECKS: 'Carregando baralhos...',
    LOADING_CARDS: 'Carregando cards...',
    LOADING_PROGRESS: 'Carregando progresso...',
    CLONING_DECK: 'Clonando baralho...',
    SAVING: 'Salvando...',
    DELETING: 'Excluindo...',
  },
};

// Cores do sistema (para consistency)
export const COLORS = {
  PRIMARY: '#4f46e5',
  PRIMARY_HOVER: '#4338ca',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  GRAY: '#6b7280',
  LIGHT_GRAY: '#f3f4f6',
};

// Configurações de validação
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SHAREABLE_ID_REGEX: /^[a-zA-Z0-9_-]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  DECK_TITLE_MIN_LENGTH: 1,
};

// Configurações de arquivo
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword'],
};

// Configurações de cache
export const CACHE_CONFIG = {
  USER_PROFILE_TTL: 5 * 60 * 1000, // 5 minutos
  DECKS_LIST_TTL: 2 * 60 * 1000, // 2 minutos
  ANALYTICS_TTL: 10 * 60 * 1000, // 10 minutos
};

export default {
  TIMEOUTS,
  PAGINATION,
  CONTENT_LIMITS,
  RATE_LIMITS,
  STUDY_CONFIG,
  UI_CONFIG,
  API_ENDPOINTS,
  HTTP_STATUS,
  MESSAGES,
  COLORS,
  VALIDATION,
  FILE_CONFIG,
  CACHE_CONFIG,
};