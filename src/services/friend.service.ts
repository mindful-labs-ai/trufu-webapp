import { supabase } from '@/lib/supabase';
import { Friend } from '@/types/friend';

export async function getAllFriends(): Promise<Friend[]> {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to fetch friends:', error);
    throw error;
  }
}
