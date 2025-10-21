'use client';

import { CurrentUser } from '@/stores/userStore';
import { Chatbot } from '@/types/friend';
import { AffinityProgressBar } from './AffinityProgressBar';

interface ChatContainerHeaderProps {
  user: CurrentUser;
  chatbot: Chatbot;
  messageCount?: number;
}

export function ChatContainerHeader({
  user,
  chatbot,
  messageCount = 0,
}: ChatContainerHeaderProps) {
  // Only show if chatbot has affinity enabled
  if (!chatbot.has_affinity) {
    return null;
  }

  return (
    <div className="border-b border-border p-3 bg-card">
      <div className="flex flex-col items-center space-y-2 max-w-[600px] mx-auto">
        <AffinityProgressBar
          userId={user.id.toString()}
          botId={chatbot.id}
          messageCount={messageCount}
        />
      </div>
    </div>
  );
}
