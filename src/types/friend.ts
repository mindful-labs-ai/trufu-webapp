export interface Chatbot {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Friend extends Chatbot {
  unread_count?: number;
  has_unread?: boolean;
}
