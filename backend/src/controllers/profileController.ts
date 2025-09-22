import { Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../config/supabaseClient';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

const profileUpdateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long').optional(),
  full_name: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional(),
  bio: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

export const getCurrentUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Profile not found' });

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching current user profile:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateCurrentUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const validatedData = profileUpdateSchema.parse(req.body);

    const { data, error } = await supabase
      .from('profiles')
      .update(validatedData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated successfully', data });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteCurrentUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const { error } = await supabase.rpc('delete_user');

    if (error) throw error;

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getProfileStatus = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url, bio, interests')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Profile not found' });

    const requiredFields = ['username', 'full_name', 'bio'];
    const isComplete = requiredFields.every(field => data[field] && data[field] !== '');
    
    res.json({ isComplete, profile: data });
  } catch (error: any) {
    console.error('Error getting profile status:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getUserProfileByUsername = async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, bio, created_at, interests')
      .eq('username', username)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Profile not found' });

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching public profile:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};