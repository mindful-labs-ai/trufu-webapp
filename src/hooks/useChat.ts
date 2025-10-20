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

  const {
    data: creditData,
    isLoading: isLoadingCredit,
    isFetching: isFetchingCredit,
  } = useCreditQuery({
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

      // 크레딧 로딩 중에는 메시지 전송 차단
      if (isLoadingCredit || isFetchingCredit) {
        throw new Error(
          '크레딧 정보를 확인하는 중입니다. 잠시만 기다려주세요.'
        );
      }

      // 크레딧 체크: 0 초과일 때만 실행 허용 (음수까지 사용 가능, 0이 되면 차단)
      if (creditData && creditData.credit <= 0) {
        throw new Error(
          '크레딧이 모두 소진되었습니다. 크레딧을 충전한 후 다시 시도해주세요.'
        );
      }

      await sendMessageAsync({
        userId,
        botId,
        botCode: botCode || '',
        content: content.trim(),
      });
    },
    [
      userId,
      botId,
      botCode,
      sendMessageAsync,
      creditData,
      isLoadingCredit,
      isFetchingCredit,
    ]
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
    isLoadingCredit: isLoadingCredit || isFetchingCredit,
  };
}
