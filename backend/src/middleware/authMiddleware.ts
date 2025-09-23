import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabaseClient';
import { AuthUser } from '@/types';
import { User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error('Authentication error:', error?.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Corrigindo a tipagem
    const user: User = data.user;
    req.user = {
        id: user.id,
        email: user.email!,
        aud: user.aud,
        exp: user.exp!,
        iat: user.iat!,
        role: user.role
    };
    return next();
  } catch (error) {
    console.error('An unexpected error occurred during authentication:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default authMiddleware;

export const authenticateToken = authMiddleware;