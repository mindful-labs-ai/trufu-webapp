import { useMemo } from 'react';
import { QUERY_KEY } from '@/constants/queryKeys';
import { getAllChatbots } from '@/services/chatbot.service';
import { Friend } from '@/types/friend';
import { useQuery } from '@tanstack/react-query';
import { useUnreadSummaryQuery } from './useUnreadSummaryQuery';

interface UseChatbotsQueryParams {
  userId?: string;
}

export function useChatbotsQuery(params?: UseChatbotsQueryParams) {
  const { data: chatbots, ...rest } = useQuery<Friend[], Error>({
    queryKey: QUERY_KEY.FRIENDS(),
    queryFn: getAllChatbots,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 2,
  });

  const { data: unreadSummary } = useUnreadSummaryQuery({
    userId: params?.userId || '',
    enabled: !!params?.userId,
  });

  const chatbotsWithUnread = useMemo(() => {
    if (!chatbots) return undefined;
    if (!unreadSummary?.length) return chatbots;

    const unreadMap = new Map(
      unreadSummary.map(item => [item.bot_id, item.unread_count])
    );

    return chatbots.map(chatbot => {
      if (chatbot.unread_count !== undefined) {
        return chatbot;
      }

      const serverUnreadCount = unreadMap.get(chatbot.id);
      if (serverUnreadCount === undefined) {
        return chatbot;
      }

      return {
        ...chatbot,
        unread_count: serverUnreadCount,
        has_unread: serverUnreadCount > 0,
      };
    });
  }, [chatbots, unreadSummary]);

  return {
    ...rest,
    data: chatbotsWithUnread,
  };
}
