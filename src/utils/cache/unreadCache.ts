import { QueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '@/constants/queryKeys';
import { Friend } from '@/types/friend';
import { UnreadSummary } from '@/types/unread';

export function incrementUnreadCount(queryClient: QueryClient, botId: string) {
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
  botId: string,
  userId: string
) {
  queryClient.setQueryData<Friend[]>(QUERY_KEY.FRIENDS(), old => {
    if (!old) return old;

    return old.map(friend =>
      friend.id === botId
        ? { ...friend, unread_count: 0, has_unread: false }
        : friend
    );
  });

  queryClient.setQueryData<UnreadSummary[]>(QUERY_KEY.UNREAD(userId), old => {
    if (!old) return old;

    return old.map(conversation =>
      conversation.bot_id === botId
        ? { ...conversation, unread_count: 0 }
        : conversation
    );
  });
}
