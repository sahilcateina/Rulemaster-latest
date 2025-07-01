import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export const createRule = async (rule: any) =>
  await supabase.from('rules').insert(rule).select().single();

export const updateRule = async (id: string, updates: any) => {
  const result = await supabase
    .from('rules')
    .update(updates)
    .eq('id', id)
    .select();

  // Check if any rows were updated
  if (result.data && result.data.length === 0) {
    return { data: null, error: { message: `Rule with id ${id} not found` } };
  }

  if (result.data && result.data.length === 1) {
    return { data: result.data[0], error: null };
  }

  return result;
};


export const deleteRule = async (id: string) =>
  await supabase.from('rules').delete().eq('id', id);

export const getAllRules = async (tenantId?: string) => {
  let query = supabase
    .from('rules')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  return await query;
};
















// import { createClient } from '@supabase/supabase-js';
// import 'dotenv/config';

// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_ANON_KEY!
// );

// export const createRule = async (rule: any) =>
//   await supabase.from('rules').insert(rule).select().single();

// export const updateRule = async (id: string, updates: any) => {
//   const result = await supabase
//     .from('rules')
//     .update(updates)
//     .eq('id', id)
//     .select();

//   if (result.data && result.data.length === 0) {
//     return { data: null, error: { message: `Rule with id ${id} not found` } };
//   }

//   if (result.data && result.data.length === 1) {
//     return { data: result.data[0], error: null };
//   }

//   return result;
// };

// export const deleteRule = async (id: string) =>
//   await supabase.from('rules').delete().eq('id', id);

// export const getAllRules = async (tenantId?: string, groupId?: string) => {
//   let query = supabase
//     .from('rules')
//     .select('*')
//     .eq('is_active', true)
//     .order('priority', { ascending: true });

//   if (tenantId) {
//     query = query.eq('tenant_id', tenantId);
//   }

//   if (groupId) {
//     query = query.eq('group_id', groupId);
//   }

//   return await query;
// };
