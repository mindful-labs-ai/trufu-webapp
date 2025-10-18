'use client';

import { useQuery } from '@tanstack/react-query';
import { ChatService } from '@/services/chat.service';
import { LatestChatSummary } from '@/types/chat';
import { QUERY_KEY } from '@/constants/queryKeys';

export function useLatestChatSummaryQuery(userId: string | null) {
  return useQuery<LatestChatSummary[]>({
    queryKey: QUERY_KEY.LATEST_CHAT_SUMMARY(userId ?? ''),
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      return ChatService.getLatestChatSummary(userId);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}
