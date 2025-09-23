import { Request, Response } from 'express';
import { z, ZodError } from 'zod';
import supabase from '../config/supabaseClient';
import logger from '../config/logger';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  username: z.string().min(3, 'Username is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});


export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, username } = registerSchema.parse(req.body);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // Corrigido: 'username' em vez de 'user_name' para consistência
        },
      },
    });

    if (error) throw error;
    if (!data.user) {
        return res.status(400).json({ message: "Registration failed, please try again." });
    }

    return res.status(201).json({ message: 'User registered successfully! Please check your email to verify your account.', user: data.user });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Registration error:', errorMessage);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
        return res.status(401).json({ message: error.message });
    }

    return res.status(200).json({ message: 'Login successful', session: data.session, user: data.user });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Login error:', errorMessage);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return res.status(200).json({ message: 'Successfully logged out' });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error('Logout error:', errorMessage);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`, 
    });

    if (error) throw error;

    return res.status(200).json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Password reset request error:', errorMessage);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and a new password are required' });
  }

  try {
    // A API do Supabase para resetar a senha via link de email não usa o token diretamente aqui.
    // O token é usado numa única vez para estabelecer a sessão do usuário.
    // A atualização da senha é feita na sessão do usuário autenticado pelo link.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw error;

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Password reset error:', errorMessage);
    return res.status(500).json({ message: 'Internal server error' });
  }
};