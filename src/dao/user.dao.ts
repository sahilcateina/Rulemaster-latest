import { createClient } from '@supabase/supabase-js';
import { User } from '../types/User';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export const createUser = async (user: User) => {
  return await supabase
    .from('users')
    .insert(user)
    .select()
    .single();
};

export const getUsers = async (id:string) => {
  return await supabase
    .from('users')
    .select("*")
    .eq("admin_id",id)
    .order('created_at', { ascending: false });
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  return await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
};

export const deleteUser = async (id: string) => {
  return await supabase
    .from('users')
    .delete()
    .eq('id', id);
};
