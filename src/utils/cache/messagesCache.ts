import { QueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '@/constants/queryKeys';
import { Message } from '@/types/chat';

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
