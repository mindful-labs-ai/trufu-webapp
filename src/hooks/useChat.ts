import { useCallback } from 'react';
import { useChatHistoryQuery } from './queries/useChatHistoryQuery';
import { useSendMessageMutation } from './mutations/useSendMessageMutation';

export function useChat(userId: string | null, botId: string | null) {
  const {
    data: messages = [],
    isLoading: isLoadingHistory,
    error: historyError,
  } = useChatHistoryQuery({ userId, botId });

  const { mutateAsync: sendMessageAsync, isPending: isLoading } =
    useSendMessageMutation();

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
