import { supabase } from '@/lib/supabase';
import {
  ChatHistoryOptions,
  ChatMessageRecord,
  LatestChatSummary,
  Message,
} from '@/types/chat';
import {
  TrufuChatRequest,
  TrufuChatResponse,
  TrufuChatSimpleMessage,
} from '@/types/trufu';

export class ChatService {
  private static readonly API_ENDPOINT = '/api/chat';
  private static readonly DEFAULT_BLOCK_ID = 'h2df43mloghruiutf9pwab1t';

  static async sendMessage(
    userId: string,
    botId: string,
    botCode: string,
    message: string,
    params: { [key: string]: unknown } = {}
  ): Promise<TrufuChatSimpleMessage & { usage?: TrufuChatResponse['usage'] }> {
    try {
      const requestBody: TrufuChatRequest = {
        userRequest: {
          timezone: 'Asia/Seoul',
          params: params,
          utterance: message,
          lang: 'ko',
          user: {
            id: userId,
            properties: {},
          },
        },
        bot: {
          id: botId,
          code: botCode,
        },
      };

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        throw new Error(
          errorData.error || `API request failed: ${response.statusText}`
        );
      }

      const data: TrufuChatResponse = await response.json();
      const outputs = data.template?.outputs || [];
      const responseMessage = outputs.find(
        (output: { simpleText?: { text: string } }) => output.simpleText
      );

      if (responseMessage?.simpleText?.text) {
        return {
          ...responseMessage,
          usage: data.usage,
        };
      }

      return {
        chat_hist_id: '',
        simpleText: {
          text: 'Sorry, I received an unexpected response format.',
        },
      };
    } catch (error) {
      console.error('ChatService error:', error);
      throw error;
    }
  }

  static async getChatHistory(options: ChatHistoryOptions): Promise<Message[]> {
    try {
      const {
        userId,
        botId,
        limit = 50,
        offset = 0,
        orderBy = 'desc',
      } = options;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('bot_id', botId)
        .order('updated_at', { ascending: orderBy === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching chat history:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      const messages: Message[] = data.map((record: ChatMessageRecord) => ({
        id: record.chat_hist_id,
        content: record.messages,
        role: record.sender === 'user' ? 'user' : 'assistant',
        timestamp: new Date(record.updated_at),
      }));

      if (orderBy === 'desc') {
        messages.reverse();
      }

      return messages;
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      throw error;
    }
  }

  static async getLatestChatSummary(
    userId: string
  ): Promise<LatestChatSummary[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('chat_hist_id, bot_id, sender, messages, updated_at')
        .eq('user_id', userId)
        .order('bot_id')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching latest chat summary:', error);
        throw error;
      }

      if (!data) {
        return [];
      }

      const seenBots = new Set<string>();
      const summaries: LatestChatSummary[] = [];

      for (const record of data) {
        if (seenBots.has(record.bot_id)) {
          continue;
        }

        summaries.push({
          botId: record.bot_id,
          lastMessage: {
            id: record.chat_hist_id,
            content: record.messages,
            role: record.sender === 'user' ? 'user' : 'assistant',
            timestamp: record.updated_at,
          },
        });

        seenBots.add(record.bot_id);
      }

      return summaries;
    } catch (error) {
      console.error('Failed to fetch latest chat summary:', error);
      throw error;
    }
  }
}
