import { supabase } from '@/lib/supabase';
import type { ChatWorkflowStatsRecord } from '@/types/workflow';

export async function getWorkflowStats(
  chatId: string
): Promise<ChatWorkflowStatsRecord | null> {
  try {
    const { data, error } = await supabase
      .from('chat_workflow_stats')
      .select('*')
      .eq('chat_id', chatId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching workflow stats:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch workflow stats:', error);
    throw error;
  }
}
