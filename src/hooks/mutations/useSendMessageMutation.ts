import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '@/services/chat.service';
import { Message } from '@/types/chat';
import { QUERY_KEY } from '@/constants/queryKeys';

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

    onMutate: async ({ userId, botId, content }) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEY.CHAT({ userId, botId }),
      });

      const previousMessages = queryClient.getQueryData<Message[]>(
        QUERY_KEY.CHAT({ userId, botId })
      );

      const userMessage: Message = {
        id: `${userId}_${Date.now()}`,
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      };

      queryClient.setQueryData<Message[]>(
        QUERY_KEY.CHAT({ userId, botId }),
        old => [...(old || []), userMessage]
      );

      return { previousMessages };
    },

    onSuccess: (data, { userId, botId }) => {
      const assistantMessage: Message = {
        id: data.chat_hist_id || '',
        content: data.simpleText?.text || '',
        role: 'assistant',
        timestamp: new Date(),
      };

      queryClient.setQueryData<Message[]>(
        QUERY_KEY.CHAT({ userId, botId }),
        old => [...(old || []), assistantMessage]
      );
    },

    onError: (error, { userId, botId }, context) => {
      console.error('Failed to send message:', error);

      if (context?.previousMessages) {
        queryClient.setQueryData(
          QUERY_KEY.CHAT({ userId, botId }),
          context.previousMessages
        );
      }

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content:
          'Sorry, I encountered an error while processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      queryClient.setQueryData<Message[]>(
        QUERY_KEY.CHAT({ userId, botId }),
        old => [...(old || []), errorMessage]
      );
    },

    onSettled: (data, error, { userId, botId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEY.CHAT({ userId, botId }),
      });
    },
  });
}
