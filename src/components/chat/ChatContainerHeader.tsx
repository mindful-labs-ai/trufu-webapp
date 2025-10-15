'use client';

import { Chatbot } from '@/types/friend';
import { CurrentUser } from '@/stores/userStore';
import { AffinityProgressBar } from './AffinityProgressBar';

interface ChatContainerHeaderProps {
  user: CurrentUser;
  chatbot: Chatbot;
  className?: string;
  compact?: boolean;
}

export function ChatContainerHeader({
  user,
  chatbot,
  className,
  compact,
}: ChatContainerHeaderProps) {
  return (
    <div className="flex flex-col items-center space-x-4">
      <h1 className="ml-2 text-xl font-semibold text-gray-800">
        💬 {chatbot.name}
      </h1>
      <AffinityProgressBar
        userId={user.id}
        botId={chatbot.id}
        className={className}
      />
    </div>
  );
}
