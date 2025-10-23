'use server';

import { supabase } from '@/lib/supabaseAdmin';

export async function checkEmailExists(
  email: string
): Promise<{ exists: boolean; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('email', email.trim());

    if (error) {
      return { exists: false, error: error.message };
    }

    return { exists: (count ?? 0) > 0 };
  } catch (err) {
    return {
      exists: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function deleteAccount(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
