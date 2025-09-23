import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvironmentConfig } from './environment';
import logger from './logger';

const getDatabaseConfig = (): { supabaseUrl: string; supabaseServiceRoleKey: string } => {
  const config = EnvironmentConfig.getDatabaseConfig();

  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    const errorMessage = 'Supabase URL and Service Role Key must be defined in environment variables';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return {
    supabaseUrl: config.supabaseUrl,
    supabaseServiceRoleKey: config.supabaseServiceRoleKey
  };
};

const { supabaseUrl, supabaseServiceRoleKey } = getDatabaseConfig();

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;