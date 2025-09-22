import { Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../config/supabaseClient';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  username: z.string().min(3, 'Username is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});


export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = registerSchema.parse(req.body);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) throw error;
    if (!data.user) return res.status(400).json({ message: "Registration failed, please try again." });

    res.status(201).json({ message: 'User registered successfully! Please check your email to verify your account.', user: data.user });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    if (error.code === '23505') { 
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
        return res.status(401).json({ message: error.message });
    }

    res.status(200).json({ message: 'Login successful', session: data.session, user: data.user });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        res.status(200).json({ message: 'Successfully logged out' });
    } catch (error: any) {
        console.error('Logout error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`, 
    });

    if (error) throw error;

    res.status(200).json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (error: any) {
    console.error('Password reset request error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and a new password are required' });
  }

  try {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw error;

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error: any) {
    console.error('Password reset error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};