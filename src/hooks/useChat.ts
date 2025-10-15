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
      if (!content.trim()) return;

      if (!userId || !botId) {
        console.warn('Cannot send message: userId or botId is null');
        return;
      }

      try {
        await sendMessageAsync({
          userId,
          botId,
          content: content.trim(),
        });
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [userId, botId, sendMessageAsync]
  );

  const clearMessages = useCallback(() => {
    console.warn('clearMessages is deprecated with TanStack Query');
  }, []);

  const loadChatHistory = useCallback(() => {
    console.warn('loadChatHistory is deprecated with TanStack Query');
  }, []);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    historyError: historyError?.message || null,
    sendMessage,
    clearMessages,
    loadChatHistory,
    isReady: Boolean(userId && botId),
  };
}
