import { supabase } from '@/lib/supabase';
import { User } from '@/types/user';

/**
 * 모든 사용자 목록을 조회합니다.
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}
