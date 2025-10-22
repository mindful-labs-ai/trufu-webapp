import { supabase } from '@/lib/supabase';
import { UnreadSummary } from '@/types/unread';

export async function getUnreadSummary(): Promise<UnreadSummary[]> {
  const { data, error } = await supabase.rpc('get_unread_summary');

  if (error) throw error;

  return data || [];
}

export async function updateLastReadAt(
  userId: string,
  botId: string
): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ last_read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('bot_id', botId);

  if (error) throw error;
}
