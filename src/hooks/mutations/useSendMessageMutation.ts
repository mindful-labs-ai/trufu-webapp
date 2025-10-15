import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '@/services/chat.service';
import { Message } from '@/types/chat';
import { chatKeys } from '../queries/useChatHistoryQuery';

interface SendMessageParams {
  userId: string;
  botId: string;
  content: string;
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, botId, content }: SendMessageParams) => {
      const response = await ChatService.sendMessage(userId, botId, content);
      return response;
    },

    // Optimistic update: 메시지 전송 전에 UI에 즉시 반영
    onMutate: async ({ userId, botId, content }) => {
      // 진행 중인 refetch를 취소하여 optimistic update를 덮어쓰지 않도록 함
      await queryClient.cancelQueries({
        queryKey: chatKeys.history(userId, botId),
      });

      // 이전 데이터를 백업
      const previousMessages = queryClient.getQueryData<Message[]>(
        chatKeys.history(userId, botId)
      );

      // 사용자 메시지를 즉시 UI에 추가 (optimistic update)
      const userMessage: Message = {
        id: `${userId}_${Date.now()}`,
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      };

      queryClient.setQueryData<Message[]>(
        chatKeys.history(userId, botId),
        old => [...(old || []), userMessage]
      );

      // 롤백을 위해 이전 상태 반환
      return { previousMessages };
    },

    // 성공 시: 서버 응답을 받아서 assistant 메시지 추가
    onSuccess: (data, { userId, botId }) => {
      const assistantMessage: Message = {
        id: data.chat_hist_id || '',
        content: data.simpleText?.text || '',
        role: 'assistant',
        timestamp: new Date(),
      };

      queryClient.setQueryData<Message[]>(
        chatKeys.history(userId, botId),
        old => [...(old || []), assistantMessage]
      );
    },

    // 에러 시: optimistic update 롤백
    onError: (error, { userId, botId }, context) => {
      console.error('Failed to send message:', error);

      // 이전 상태로 롤백
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.history(userId, botId),
          context.previousMessages
        );
      }

      // 에러 메시지 추가
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content:
          'Sorry, I encountered an error while processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      queryClient.setQueryData<Message[]>(
        chatKeys.history(userId, botId),
        old => [...(old || []), errorMessage]
      );
    },

    // 완료 후: 최신 데이터로 동기화 (optional)
    onSettled: (data, error, { userId, botId }) => {
      // 서버와 동기화를 위해 refetch (선택적)
      // queryClient.invalidateQueries({
      //   queryKey: chatKeys.history(userId, botId),
      // });
    },
  });
}
