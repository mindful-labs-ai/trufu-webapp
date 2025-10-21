import { QUERY_KEY } from '@/constants/queryKeys';
import { MAX_MESSAGE_LENGTH } from '@/constants/validation';
import { ChatService } from '@/services/chat.service';
import { LatestChatSummary, Message } from '@/types/chat';
import { useFriendStore } from '@/stores/friendStore';
import { consumeCredit } from '@/services/token-client.service';
import { updateLastReadAt } from '@/services/unread.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateMessagesCache,
  updateChatSummaryCache,
  incrementUnreadCount,
} from '@/utils/messageCache';

interface SendMessageParams {
  userId: string;
  botId: string;
  botCode: string;
  content: string;
}

export function useSendMessageMutation(userId?: string, botId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userId && botId ? ['SEND_MESSAGE', userId, botId] : undefined,
    mutationFn: async ({
      userId,
      botId,
      botCode,
      content,
    }: SendMessageParams) => {
      if (content.length > MAX_MESSAGE_LENGTH) {
        throw new Error(
          `메시지는 최대 ${MAX_MESSAGE_LENGTH}자까지 입력할 수 있습니다.`
        );
      }

      const response = await ChatService.sendMessage(
        userId,
        botId,
        botCode,
        content
      );

      const totalTokens = response.usage?.tokenUsage?.totalTokens;
      if (totalTokens !== undefined && totalTokens > 0) {
        await consumeCredit('openai', totalTokens);
      }

      return response;
    },

    onMutate: async ({ userId, botId, botCode, content }) => {
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

      updateMessagesCache(queryClient, userId, botId, userMessage);
      updateChatSummaryCache(queryClient, userId, botId, {
        id: userMessage.id,
        content: userMessage.content,
        role: 'user',
        timestamp: new Date().toISOString(),
      });

      return { previousMessages, previousSummary };
    },

    onSuccess: (data, { userId, botId }) => {
      const assistantMessage: Message = {
        id: data.chat_hist_id || '',
        content: data.simpleText?.text || '',
        role: 'assistant',
        timestamp: new Date(),
      };

      updateMessagesCache(queryClient, userId, botId, assistantMessage);
      updateChatSummaryCache(queryClient, userId, botId, {
        id: assistantMessage.id,
        content: assistantMessage.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      });

      const currentSelectedFriend = useFriendStore.getState().selectedFriend;
      const isCurrentlyViewing = currentSelectedFriend?.id === botId;

      if (isCurrentlyViewing) {
        updateLastReadAt(userId, botId);
      } else {
        incrementUnreadCount(queryClient, botId);
      }

      queryClient.invalidateQueries({
        queryKey: QUERY_KEY.CREDIT('openai'),
      });
    },

    onError: (error, { userId, botId }, context) => {
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

      queryClient.invalidateQueries({
        queryKey: QUERY_KEY.CREDIT('openai'),
      });

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content:
          error instanceof Error && error.message.includes('크레딧')
            ? error.message
            : 'Sorry, I encountered an error while processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      updateMessagesCache(queryClient, userId, botId, errorMessage);
      updateChatSummaryCache(queryClient, userId, botId, {
        id: errorMessage.id,
        content: errorMessage.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      });
    },
  });
}
