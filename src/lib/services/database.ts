import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabaseUrl: string = PUBLIC_SUPABASE_URL;
const supabaseKey: string = PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
