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
  return (
    <div className="flex flex-col items-center space-y-2 max-w-[600px] mx-auto">
      <AffinityProgressBar
        userId={user.id.toString()}
        botId={chatbot.id}
        hasAffinity={chatbot.has_affinity}
        messageCount={messageCount}
      />
    </div>
  );
}
