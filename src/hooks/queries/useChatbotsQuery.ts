import { QUERY_KEY } from '@/constants/queryKeys';
import { getAllChatbots } from '@/services/chatbot.service';
import { Friend } from '@/types/friend';
import { useQuery } from '@tanstack/react-query';

export function useChatbotsQuery() {
  return useQuery<Friend[], Error>({
    queryKey: QUERY_KEY.FRIENDS(),
    queryFn: getAllChatbots,
    staleTime: 1000 * 60 * 10, // 10분 동안 fresh 상태 유지 (친구 목록은 자주 변경되지 않음)
    gcTime: 1000 * 60 * 30, // 30분 후 가비지 컬렉션
    retry: 2, // 실패 시 2번 재시도
  });
}
