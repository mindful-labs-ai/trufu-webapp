import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatHistoryQuery } from './queries/useChatHistoryQuery';
import { useSendMessageMutation } from './mutations/useSendMessageMutation';
import { useCreditQuery } from './queries/useCreditQuery';

export function useChat(
  userId: string | null,
  botId: string | null,
  botCode: string | null
) {
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading: isLoadingHistory,
    error: historyError,
  } = useChatHistoryQuery({ userId, botId });

  const { data: creditData } = useCreditQuery({
    type: 'openai',
    enabled: !!userId,
  });

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

      if (creditData && creditData.credit <= 0) {
        throw new Error(
          '크레딧이 모두 소진되었습니다. 크레딧을 충전한 후 다시 시도해주세요.'
        );
      }

      await sendMessageAsync({
        userId,
        botId,
        botCode,
        content: content.trim(),
      });
    },
    [userId, botId, botCode, sendMessageAsync, creditData]
  );

  return {
    messages,
    isLoading: actualIsLoading,
    isLoadingHistory,
    historyError: historyError?.message || null,
    sendMessage,
    isReady: Boolean(userId && botId),
    hasCredit: creditData ? creditData.credit > 0 : true,
    creditAmount: creditData?.credit ?? null,
  };
}
