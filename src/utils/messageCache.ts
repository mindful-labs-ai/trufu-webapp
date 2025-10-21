import { QueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '@/constants/queryKeys';
import { Friend } from '@/types/friend';
import { LatestChatSummary, Message } from '@/types/chat';
import { updateChatSummary } from './chatSummary';

export function updateMessagesCache(
  queryClient: QueryClient,
  userId: string,
  botId: string,
  message: Message
) {
  queryClient.setQueryData<Message[]>(
    QUERY_KEY.CHAT({ userId, botId }),
    old => [...(old || []), message]
  );
}

export function updateChatSummaryCache(
  queryClient: QueryClient,
  userId: string,
  botId: string,
  message: { id: string; content: string; role: 'user' | 'assistant'; timestamp: string }
) {
  queryClient.setQueryData<LatestChatSummary[]>(
    QUERY_KEY.LATEST_CHAT_SUMMARY(userId),
    old => updateChatSummary(old || [], botId, message)
  );
}

export function incrementUnreadCount(
  queryClient: QueryClient,
  botId: string
) {
  queryClient.setQueryData<Friend[]>(QUERY_KEY.FRIENDS(), old =>
    old?.map(friend =>
      friend.id === botId
        ? {
            ...friend,
            unread_count: (friend.unread_count || 0) + 1,
            has_unread: true,
          }
        : friend
    )
  );
}

export function resetUnreadCount(
  queryClient: QueryClient,
  botId: string
) {
  queryClient.setQueryData<Friend[]>(QUERY_KEY.FRIENDS(), old =>
    old?.map(friend =>
      friend.id === botId
        ? { ...friend, unread_count: 0, has_unread: false }
        : friend
    )
  );
}
