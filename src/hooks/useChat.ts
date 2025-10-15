import { useCallback } from 'react';
import { useChatHistoryQuery } from './queries/useChatHistoryQuery';
import { useSendMessageMutation } from './mutations/useSendMessageMutation';

export function useChat(userId: string | null, botId: string | null) {
  // TanStack Query로 채팅 내역 가져오기
  const {
    data: messages = [],
    isLoading: isLoadingHistory,
    error: historyError,
  } = useChatHistoryQuery({ userId, botId });

  // TanStack Mutation으로 메시지 전송
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
        // 에러는 mutation의 onError에서 처리됨
      }
    },
    [userId, botId, sendMessageAsync]
  );

  const clearMessages = useCallback(() => {
    // Query를 무효화하거나 초기화하려면 queryClient를 사용해야 함
    // 현재는 필요 없을 수 있음 (친구 변경 시 자동으로 새 데이터 로드)
    console.warn('clearMessages is deprecated with TanStack Query');
  }, []);

  const loadChatHistory = useCallback(() => {
    // TanStack Query가 자동으로 관리하므로 필요 없음
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
