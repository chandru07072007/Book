import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sdgszspdgrtbrsvqlzgh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MbwSw_gZIXI-DkkjIOr0CQ_f_G-WGyX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
