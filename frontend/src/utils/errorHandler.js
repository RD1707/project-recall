import toast from 'react-hot-toast';

// Códigos de erro padronizados
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Mapeamento de erros comuns
const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Problema de conexão. Verifique sua internet.',
  [ERROR_CODES.AUTH_ERROR]: 'Erro de autenticação. Faça login novamente.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Dados inválidos fornecidos.',
  [ERROR_CODES.PERMISSION_ERROR]: 'Você não tem permissão para esta ação.',
  [ERROR_CODES.NOT_FOUND]: 'Recurso não encontrado.',
  [ERROR_CODES.RATE_LIMITED]: 'Muitas solicitações. Tente novamente mais tarde.',
  [ERROR_CODES.SERVER_ERROR]: 'Erro interno do servidor.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Tempo limite esgotado.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Erro inesperado. Tente novamente.'
};

// Classe principal para tratamento de erros
class ErrorHandler {
  constructor() {
    this.listeners = [];
    this.errorQueue = [];
    this.maxQueueSize = 50;
    
    // Capturar erros não tratados
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
      window.addEventListener('error', this.handleGlobalError.bind(this));
    }
  }

  // Adicionar listener para erros
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notificar listeners
  notifyListeners(error) {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  // Categorizar erro
  categorizeError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return ERROR_CODES.NETWORK_ERROR;
    }
    
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return ERROR_CODES.TIMEOUT_ERROR;
    }
    
    if (error.message?.includes('JWT') || error.message?.includes('unauthorized')) {
      return ERROR_CODES.AUTH_ERROR;
    }
    
    if (error.code) {
      const codeMap = {
        'VALIDATION_ERROR': ERROR_CODES.VALIDATION_ERROR,
        'AUTH_TOKEN_EXPIRED': ERROR_CODES.AUTH_ERROR,
        'PERMISSION_DENIED': ERROR_CODES.PERMISSION_ERROR,
        'NOT_FOUND': ERROR_CODES.NOT_FOUND,
        'RATE_LIMITED': ERROR_CODES.RATE_LIMITED,
        'INTERNAL_SERVER_ERROR': ERROR_CODES.SERVER_ERROR
      };
      
      return codeMap[error.code] || ERROR_CODES.UNKNOWN_ERROR;
    }

    if (error.response) {
      const status = error.response.status;
      if (status === 401) return ERROR_CODES.AUTH_ERROR;
      if (status === 403) return ERROR_CODES.PERMISSION_ERROR;
      if (status === 404) return ERROR_CODES.NOT_FOUND;
      if (status === 429) return ERROR_CODES.RATE_LIMITED;
      if (status >= 500) return ERROR_CODES.SERVER_ERROR;
      if (status >= 400) return ERROR_CODES.VALIDATION_ERROR;
    }

    return ERROR_CODES.UNKNOWN_ERROR;
  }

  // Processar erro
  processError(error, context = {}) {
    const errorInfo = {
      originalError: error,
      message: error.message || 'Erro desconhecido',
      code: this.categorizeError(error),
      timestamp: new Date().toISOString(),
      context,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Adicionar à fila
    this.addToQueue(errorInfo);

    return errorInfo;
  }

  // Adicionar erro à fila
  addToQueue(errorInfo) {
    this.errorQueue.unshift(errorInfo);
    
    // Manter tamanho máximo da fila
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(0, this.maxQueueSize);
    }
  }

  // Obter últimos erros
  getRecentErrors(limit = 10) {
    return this.errorQueue.slice(0, limit);
  }

  // Limpar fila de erros
  clearQueue() {
    this.errorQueue = [];
  }

  // Tratar erro com UI
  handleError(error, options = {}) {
    const {
      showToast = true,
      customMessage = null,
      context = {},
      silent = false
    } = options;

    const errorInfo = this.processError(error, context);
    
    // Notificar listeners
    this.notifyListeners(errorInfo);

    // Log do erro
    console.error('[ErrorHandler]', errorInfo);

    // Mostrar toast se solicitado
    if (showToast && !silent) {
      const message = customMessage || ERROR_MESSAGES[errorInfo.code] || errorInfo.message;
      
      switch (errorInfo.code) {
        case ERROR_CODES.VALIDATION_ERROR:
        case ERROR_CODES.PERMISSION_ERROR:
          toast.error(message, { duration: 4000 });
          break;
        case ERROR_CODES.RATE_LIMITED:
          toast.error(message, { duration: 6000 });
          break;
        case ERROR_CODES.NETWORK_ERROR:
        case ERROR_CODES.TIMEOUT_ERROR:
          toast.error(message, { 
            duration: 5000,
            action: {
              label: 'Tentar Novamente',
              onClick: () => window.location.reload()
            }
          });
          break;
        default:
          toast.error(message, { duration: 4000 });
      }
    }

    return errorInfo;
  }

  // Tratar rejection não capturada
  handleUnhandledRejection(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    
    this.handleError(event.reason, {
      context: { type: 'unhandledRejection' },
      showToast: false // Evitar spam de toasts
    });

    // Prevenir que o erro apareça no console do browser
    event.preventDefault();
  }

  // Tratar erro global
  handleGlobalError(event) {
    console.error('Global Error:', event.error);
    
    this.handleError(event.error, {
      context: { 
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      showToast: false // Evitar spam de toasts
    });
  }

  // Função utilitária para retry
  async retry(fn, maxAttempts = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  // Função para reportar erro para serviço externo
  reportError(errorInfo, options = {}) {
    if (process.env.NODE_ENV === 'production') {
      // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
      console.log('Would report to error tracking service:', errorInfo);
    }
  }
}

// Instância global do tratador de erros
export const errorHandler = new ErrorHandler();

// Função de conveniência
export const handleError = (error, options) => errorHandler.handleError(error, options);

// Hook para React
export const useErrorHandler = () => {
  return {
    handleError: (error, options) => errorHandler.handleError(error, options),
    retry: (fn, maxAttempts, delay) => errorHandler.retry(fn, maxAttempts, delay),
    getRecentErrors: (limit) => errorHandler.getRecentErrors(limit),
    addListener: (callback) => errorHandler.addListener(callback)
  };
};

export default errorHandler;