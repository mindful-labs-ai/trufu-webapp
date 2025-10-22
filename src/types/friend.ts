export interface Chatbot {
  id: string;
  name: string;
  description: string;
  agent_code: string;
  avatar?: string;
  order?: number | null;
  locked: boolean;
  created_at: string;
  updated_at: string;
  has_affinity: boolean;
}

export interface Friend extends Chatbot {
  unread_count?: number;
  has_unread?: boolean;
}
