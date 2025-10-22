import { QueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '@/constants/queryKeys';
import { LatestChatSummary } from '@/types/chat';
import { updateChatSummary } from '../chatSummary';

export function updateChatSummaryCache(
  queryClient: QueryClient,
  userId: string,
  botId: string,
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
  }
) {
  queryClient.setQueryData<LatestChatSummary[]>(
    QUERY_KEY.LATEST_CHAT_SUMMARY(userId),
    old => updateChatSummary(old || [], botId, message)
  );
}
