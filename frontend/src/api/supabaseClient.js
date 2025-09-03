import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://khofqsjwyunicxdxapih.supabase.co"; //
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob2Zxc2p3eXVuaWN4ZHhhcGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjM2NDksImV4cCI6MjA3MTY5OTY0OX0.3Fr8b6u3b6dqoh84qx0ulcddb-vj4gGqlOQvAI2weGE"; //

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);