import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '@/services/chat.service';
import { LatestChatSummary, Message } from '@/types/chat';
import { QUERY_KEY } from '@/constants/queryKeys';
import { updateChatSummary } from '@/utils/chatSummary';
import { Friend } from '@/types/friend';
import { useFriendStore } from '@/stores/friendStore';

interface SendMessageParams {
  userId: string;
  botId: string;
  content: string;
}

export function useSendMessageMutation(userId?: string, botId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userId && botId ? ['SEND_MESSAGE', userId, botId] : undefined,
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
        old =>
          updateChatSummary(old || [], botId, {
            id: userMessage.id,
            content: userMessage.content,
            role: 'user',
            timestamp: new Date().toISOString(),
          })
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
        old =>
          updateChatSummary(old || [], botId, {
            id: assistantMessage.id,
            content: assistantMessage.content,
            role: 'assistant',
            timestamp: new Date().toISOString(),
          })
      );

      // AI 응답이 현재 보고 있지 않은 채팅방에서 왔을 경우 unread 증가 (클라이언트 상태)
      const currentSelectedFriend = useFriendStore.getState().selectedFriend;
      const isCurrentlyViewing = currentSelectedFriend?.id === botId;

      if (!isCurrentlyViewing) {
        queryClient.setQueryData<Friend[]>(
          QUERY_KEY.FRIENDS(),
          old => old?.map(friend =>
            friend.id === botId
              ? {
                  ...friend,
                  unread_count: (friend.unread_count || 0) + 1,
                  has_unread: true,
                }
              : friend
          )
        );
      }

      // TODO: [DB 뷰 준비 후] 서버에 last_read_message_id 업데이트
      // 1. 현재 보고 있는 채팅방일 경우 assistantMessage.id를 last_read_message_id로 업데이트
      //    - API: PATCH /api/users/{userId}/chatrooms/{botId}/read
      //    - Body: { last_read_message_id: assistantMessage.id }
      // 2. 위의 클라이언트 unread 증가 로직 제거
      // 3. 서버의 chatbots_with_unread 뷰에서 자동으로 unread 계산
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
        old =>
          updateChatSummary(old || [], botId, {
            id: errorMessage.id,
            content: errorMessage.content,
            role: 'assistant',
            timestamp: new Date().toISOString(),
          })
      );
    },
  });
}
