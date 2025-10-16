import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatHistoryQuery } from './queries/useChatHistoryQuery';
import { useSendMessageMutation } from './mutations/useSendMessageMutation';
import { QUERY_KEY } from '@/constants/queryKeys';
import { LatestChatSummary } from '@/types/chat';

export function useChat(userId: string | null, botId: string | null) {
  const {
    data: messages = [],
    isLoading: isLoadingHistory,
    error: historyError,
  } = useChatHistoryQuery({ userId, botId });

  const { mutateAsync: sendMessageAsync, isPending: isLoading } =
    useSendMessageMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !botId || messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    queryClient.setQueryData<LatestChatSummary[]>(
      QUERY_KEY.LATEST_CHAT_SUMMARY(userId),
      old => {
        const summaries = [...(old || [])];
        const nextMessage: LatestChatSummary['lastMessage'] = {
          id: lastMessage.id,
          content: lastMessage.content,
          role: lastMessage.role,
          timestamp: lastMessage.timestamp.toISOString(),
        };

        const index = summaries.findIndex(summary => summary.botId === botId);
        if (index >= 0) {
          summaries[index] = { botId, lastMessage: nextMessage };
        } else {
          summaries.push({ botId, lastMessage: nextMessage });
        }

        return summaries;
      }
    );
  }, [messages, userId, botId, queryClient]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !userId || !botId) {
        return;
      }

      await sendMessageAsync({
        userId,
        botId,
        content: content.trim(),
      });
    },
    [userId, botId, sendMessageAsync]
  );

  return {
    messages,
    isLoading,
    isLoadingHistory,
    historyError: historyError?.message || null,
    sendMessage,
    isReady: Boolean(userId && botId),
  };
}
