import { supabase } from '@/lib/supabase';
import { ChangePasswordParams, User } from '@/types/user';

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

/**
 * 현재 로그인된 사용자의 비밀번호를 변경합니다.
 */
export async function changePassword({
  email,
  currentPassword,
  newPassword,
}: ChangePasswordParams): Promise<void> {
  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      throw signInError;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    console.error('Failed to change password:', error);
    throw error;
  }
}
