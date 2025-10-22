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
      console.error('Email check error:', error);
      return { exists: false, error: error.message };
    }

    return { exists: (count ?? 0) > 0 };
  } catch (err) {
    console.error('Unexpected error in checkEmailExists:', err);
    return {
      exists: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
