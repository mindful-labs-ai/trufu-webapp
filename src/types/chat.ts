export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// chat_messages 테이블 구조에 맞는 타입
export interface ChatMessageRecord {
  chat_hist_id: string;
  bot_id: string;
  user_id: string;
  sender: string; // 'user' | 'assistant'
  messages: string;
  type: string;
  updated_at: string;
}

export interface ChatHistoryOptions {
  userId: string;
  botId?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
}
