import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export const getGroupById = async (id: string) => {
  const result = await supabase
    .from('groups')
    .select('*')
    .eq('admin_id', id)

  // Handle the case where no group is found
  if (result.error && result.error.code === 'PGRST116') {
    return { data: null, error: { message: `Group with id ${id} not found` } };
  }

  return result;
};

