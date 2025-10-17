import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatHistoryQuery } from './queries/useChatHistoryQuery';
import { useSendMessageMutation } from './mutations/useSendMessageMutation';

export function useChat(userId: string | null, botId: string | null) {
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading: isLoadingHistory,
    error: historyError,
  } = useChatHistoryQuery({ userId, botId });

  const { mutateAsync: sendMessageAsync, isPending: isLoading } =
    useSendMessageMutation(userId || undefined, botId || undefined);

  const mutationKey =
    userId && botId ? ['SEND_MESSAGE', userId, botId] : undefined;
  const mutationState = queryClient.getMutationCache().find({
    mutationKey,
    predicate: mutation => mutation.state.status === 'pending',
  });

  const actualIsLoading = mutationState ? true : isLoading;

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
    isLoading: actualIsLoading,
    isLoadingHistory,
    historyError: historyError?.message || null,
    sendMessage,
    isReady: Boolean(userId && botId),
  };
}
