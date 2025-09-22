import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Pegamos as variáveis de ambiente e já definimos o tipo esperado (string)
const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseKey: string = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Key must be defined in .env file');
  throw new Error('Supabase URL and Key must be defined in .env file');
}

// Criamos a instância do cliente e a tipamos com SupabaseClient
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Usamos o 'export default' do padrão ES Modules
export default supabase;