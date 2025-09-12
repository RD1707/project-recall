import toast from 'react-hot-toast';

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

class ErrorHandler {
  constructor() {
    this.listeners = [];
    this.errorQueue = [];
    this.maxQueueSize = 50;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
      window.addEventListener('error', this.handleGlobalError.bind(this));
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(error) {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

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

    this.addToQueue(errorInfo);

    return errorInfo;
  }

  addToQueue(errorInfo) {
    this.errorQueue.unshift(errorInfo);
    
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(0, this.maxQueueSize);
    }
  }

  getRecentErrors(limit = 10) {
    return this.errorQueue.slice(0, limit);
  }

  clearQueue() {
    this.errorQueue = [];
  }

  handleError(error, options = {}) {
    const {
      showToast = true,
      customMessage = null,
      context = {},
      silent = false
    } = options;

    const errorInfo = this.processError(error, context);
    
    this.notifyListeners(errorInfo);

    console.error('[ErrorHandler]', errorInfo);

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

  handleUnhandledRejection(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    
    this.handleError(event.reason, {
      context: { type: 'unhandledRejection' },
      showToast: false 
    });

    event.preventDefault();
  }

  handleGlobalError(event) {
    console.error('Global Error:', event.error);
    
    this.handleError(event.error, {
      context: { 
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      showToast: false 
    });
  }

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
        delay *= 2; 
      }
    }
  }

  reportError(errorInfo, options = {}) {
    if (process.env.NODE_ENV === 'production') {
      console.log('Would report to error tracking service:', errorInfo);
    }
  }
}

export const errorHandler = new ErrorHandler();

export const handleError = (error, options) => errorHandler.handleError(error, options);

export const useErrorHandler = () => {
  return {
    handleError: (error, options) => errorHandler.handleError(error, options),
    retry: (fn, maxAttempts, delay) => errorHandler.retry(fn, maxAttempts, delay),
    getRecentErrors: (limit) => errorHandler.getRecentErrors(limit),
    addListener: (callback) => errorHandler.addListener(callback)
  };
};

export default errorHandler;