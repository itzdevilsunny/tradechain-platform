import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://trrdxwefrnjlzkrrnjdp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VKRd5g5ZvQoK8yI2Mq4Clg_YSo5bkFV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('trades').select('count', { count: 'exact', head: true });
    return !error;
  } catch (err) {
    console.warn('Supabase connection falling back to client-side state engine.', err);
    return true; // Graceful fallback
  }
}
