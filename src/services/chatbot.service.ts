import { supabase } from '@/lib/supabase';
import { Chatbot } from '@/types/friend';

export async function getAllChatbots(): Promise<Chatbot[]> {
  try {
    // @deprecated 임시로 chatbots 테이블 사용 (unread 필드는 클라이언트에서 관리)
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .order('order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      system_prompt: item.system_prompt || '',
      avatar: item.avatar || undefined,
      agent_code: item.agent_code || '',
      order: item.order || null,
      created_at: item.created_at,
      updated_at: item.updated_at,
      unread_count: undefined,
      has_unread: undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch chatbots:', error);
    throw error;
  }
}

// TODO: [DB 뷰 준비 후] 아래 함수로 교체
// 1. Supabase에 chatbots_with_unread 뷰 생성
//    - user_id와 bot_id별 last_read_message_id 저장하는 테이블 필요
//    - 뷰에서 last_read_message_id와 최신 메시지를 비교하여 unread_count 계산
// 2. 아래 주석 해제하고 위의 getAllFriends 함수 제거
// 3. useSendMessageMutation과 ChatContainer의 클라이언트 unread 로직 제거
/*
export async function getAllFriends(): Promise<Friend[]> {
  try {
    const { data, error } = await supabase
      .from('chatbots_with_unread')
      .select('chatbot_id, name, avatar_url, unread_count, has_unread, description, system_prompt, order, created_at, updated_at')
      .order('order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.chatbot_id,
      name: item.name,
      description: item.description || '',
      system_prompt: item.system_prompt || '',
      avatar: item.avatar_url || undefined,
      order: item.order || null,
      created_at: item.created_at,
      updated_at: item.updated_at,
      unread_count: item.unread_count,
      has_unread: item.has_unread,
    }));
  } catch (error) {
    console.error('Failed to fetch friends:', error);
    throw error;
  }
}
*/
