'use client';

import { Chatbot } from '@/types/friend';
import { AffinityProgressBar } from './AffinityProgressBar';
import { CurrentUser } from '@/stores/userStore';

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
    <div className="flex flex-col items-center space-x-4">
      <h1 className="ml-2 text-xl font-semibold text-foreground">
        💬 {chatbot.name}
      </h1>
      <AffinityProgressBar
        userId={user.id.toString()}
        botId={chatbot.id}
        messageCount={messageCount}
      />
    </div>
  );
}
