import { useQuery } from '@tanstack/react-query';
import { ChatService } from '@/services/chat.service';
import { Message } from '@/types/chat';
import { QUERY_KEY } from '@/constants/queryKeys';

interface UseChatHistoryQueryParams {
  userId: string | null;
  botId: string | null;
  limit?: number;
}

export const chatKeys = {
  history: (userId: string, botId: string) => {
    return {
      userId,
      botId,
    };
  },
};

export function useChatHistoryQuery({
  userId,
  botId,
  limit = 50,
}: UseChatHistoryQueryParams) {
  return useQuery<Message[], Error>({
    queryKey: QUERY_KEY.CHAT({ userId: userId || '', botId: botId || '' }),
    queryFn: async () => {
      if (!userId || !botId) {
        return [];
      }

      const messages = await ChatService.getChatHistory({
        userId,
        botId,
        limit,
        orderBy: 'desc',
      });

      return messages;
    },
    enabled: Boolean(userId && botId),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}
