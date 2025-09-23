import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabaseClient';
import { AuthUser } from '@/types';
import { User } from '@supabase/supabase-js';
import logger from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.error('Authentication error:', error?.message || 'User not found');
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user: User = data.user;

    // Validação adequada das propriedades obrigatórias
    if (!user.email) {
      logger.error('User email is missing from token');
      return res.status(401).json({ message: 'Invalid token: missing email' });
    }

    if (user.exp === undefined || user.iat === undefined) {
      logger.error('Token missing required timestamp fields');
      return res.status(401).json({ message: 'Invalid token: missing timestamps' });
    }

    req.user = {
        id: user.id,
        email: user.email,
        aud: user.aud,
        exp: user.exp,
        iat: user.iat,
        role: user.role
    };
    return next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
    logger.error('An unexpected error occurred during authentication:', errorMessage);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default authMiddleware;

export const authenticateToken = authMiddleware;