import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '@/services/chat.service';
import { LatestChatSummary, Message } from '@/types/chat';
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
      const previousSummary = queryClient.getQueryData<LatestChatSummary[]>(
        QUERY_KEY.LATEST_CHAT_SUMMARY(userId)
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

      queryClient.setQueryData<LatestChatSummary[]>(
        QUERY_KEY.LATEST_CHAT_SUMMARY(userId),
        old => {
          const summaries = [...(old || [])];
          const nextMessage: LatestChatSummary['lastMessage'] = {
            id: userMessage.id,
            content: userMessage.content,
            role: 'user',
            timestamp: new Date().toISOString(),
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

      return { previousMessages, previousSummary };
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

      queryClient.setQueryData<LatestChatSummary[]>(
        QUERY_KEY.LATEST_CHAT_SUMMARY(userId),
        old => {
          const summaries = [...(old || [])];
          const nextMessage: LatestChatSummary['lastMessage'] = {
            id: assistantMessage.id,
            content: assistantMessage.content,
            role: 'assistant',
            timestamp: new Date().toISOString(),
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
    },

    onError: (error, { userId, botId }, context) => {
      console.error('Failed to send message:', error);

      if (context?.previousMessages) {
        queryClient.setQueryData(
          QUERY_KEY.CHAT({ userId, botId }),
          context.previousMessages
        );
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(
          QUERY_KEY.LATEST_CHAT_SUMMARY(userId),
          context.previousSummary
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

      queryClient.setQueryData<LatestChatSummary[]>(
        QUERY_KEY.LATEST_CHAT_SUMMARY(userId),
        old => {
          const summaries = [...(old || [])];
          const nextMessage: LatestChatSummary['lastMessage'] = {
            id: errorMessage.id,
            content: errorMessage.content,
            role: 'assistant',
            timestamp: new Date().toISOString(),
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
    },
  });
}
