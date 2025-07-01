import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export const getRoleById = async (id: string) => {
  return await supabase
    .from('roles')
    .select('*')
    .eq('admin_id', id)
    // .single();
};
