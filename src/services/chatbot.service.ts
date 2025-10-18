import { supabase } from '@/lib/supabase';
import { Chatbot } from '@/types/friend';

export async function getAllChatbots(): Promise<Chatbot[]> {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to fetch chatbots:', error);
    throw error;
  }
}
