import { ChatService } from '@/services/chat.service';
import { Message } from '@/types/chat';
import { useCallback, useEffect, useState } from 'react';

export function useChat(userId: string | null, botId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadChatHistory = useCallback(async () => {
    if (!userId || !botId) {
      setMessages([]);
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const historyMessages = await ChatService.getChatHistory({
        userId,
        botId,
        limit: 50,
        orderBy: 'desc',
      });

      if (historyMessages.length > 0) {
        setMessages(historyMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setHistoryError('이전 대화를 불러오는데 실패했습니다.');
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId, botId]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      if (!userId || !botId) {
        console.warn('Cannot send message: userId or botId is null');
        return;
      }

      const messageId = `${userId}_${Date.now()}`;
      const userMessage: Message = {
        id: messageId,
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const responseMessage = await ChatService.sendMessage(
          userId,
          botId,
          content.trim()
        );

        const assistantMessage: Message = {
          id: responseMessage.chat_hist_id || '',
          content: responseMessage.simpleText?.text || '',
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Failed to send message:', error);

        const errorMessageId = `${userId}_${Date.now() + 1}`;
        const errorMessage: Message = {
          id: errorMessageId,
          content:
            'Sorry, I encountered an error while processing your message. Please try again.',
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, botId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setHistoryError(null);
  }, []);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    historyError,
    sendMessage,
    clearMessages,
    loadChatHistory,
    isReady: Boolean(userId && botId),
  };
}
