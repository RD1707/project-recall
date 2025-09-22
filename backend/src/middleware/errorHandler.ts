import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '@/config/logger';
import { AppError, ApiResponse } from '@/types';

// Custom error class
export class CustomError extends Error implements AppError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error classes
export class ValidationError extends CustomError {
  constructor(message: string, code?: string) {
    super(message, 400, true, code);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTH_REQUIRED');
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'INSUFFICIENT_PERMISSIONS');
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND');
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, code?: string) {
    super(message, 409, true, code);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT_EXCEEDED');
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, true, 'INTERNAL_SERVER_ERROR');
  }
}

// Error type guards
const isCustomError = (error: any): error is CustomError => {
  return error instanceof CustomError;
};

const isZodError = (error: any): error is ZodError => {
  return error instanceof ZodError;
};

// Error response formatter
const formatErrorResponse = (error: CustomError | Error, isDevelopment: boolean): ApiResponse => {
  if (isCustomError(error)) {
    return {
      success: false,
      error: error.message,
      ...(error.code && { code: error.code }),
      ...(isDevelopment && { stack: error.stack }),
    };
  }

  // Don't expose internal error details in production
  return {
    success: false,
    error: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack }),
  };
};

// Zod error formatter
const formatZodError = (error: ZodError): ApiResponse => {
  const validationErrors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    value: err.code === 'invalid_type' ? err.received : undefined,
  }));

  return {
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    data: { validationErrors },
  };
};

// Main error handler middleware
export const errorHandler = (
  error: Error | CustomError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error details
  const errorContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.method !== 'GET' ? req.body : undefined,
    params: req.params,
    query: req.query,
  };

  if (isCustomError(error) && error.isOperational) {
    // Log operational errors as warnings
    logger.warn(`Operational Error: ${error.message}`, {
      ...errorContext,
      statusCode: error.statusCode,
      code: error.code,
      stack: isDevelopment ? error.stack : undefined,
    });
  } else {
    // Log programming errors as errors
    logger.error(`System Error: ${error.message}`, {
      ...errorContext,
      error: error.message,
      stack: error.stack,
    });
  }

  // Handle different error types
  if (isZodError(error)) {
    const response = formatZodError(error);
    res.status(400).json(response);
    return;
  }

  if (isCustomError(error)) {
    const response = formatErrorResponse(error, isDevelopment);
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle specific known errors
  if (error.name === 'CastError') {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid resource ID format',
      code: 'INVALID_ID',
    };
    res.status(400).json(response);
    return;
  }

  if (error.name === 'ValidationError') {
    const response: ApiResponse = {
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR',
    };
    res.status(400).json(response);
    return;
  }

  if (error.name === 'MongoNetworkError') {
    const response: ApiResponse = {
      success: false,
      error: 'Database connection error',
      code: 'DATABASE_ERROR',
    };
    res.status(503).json(response);
    return;
  }

  // Default error response
  const response = formatErrorResponse(error, isDevelopment);
  res.status(500).json(response);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
  };

  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json(response);
};

// Async error wrapper
export const asyncHandler = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<void | U>,
) => {
  return (req: T, res: U, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation middleware wrapper
export const validateRequest = <T>(schema: any, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req[property]);
      req[property] = validated;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limit error handler
export const rateLimitHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  };

  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
  });

  res.status(429).json(response);
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateRequest,
  rateLimitHandler,
  CustomError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
};