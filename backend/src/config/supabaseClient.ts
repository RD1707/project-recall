import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseKey: string = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Key must be defined in .env file');
  throw new Error('Supabase URL and Key must be defined in .env file');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;