'use client';

import { Message } from '@/types/chat';
import { CurrentUser } from '@/stores/userStore';
import { parseSimpleMarkdown, sanitizeHtml } from '@/utils/markdown';
import { useState } from 'react';
import { WorkflowStatsModal } from './WorkflowStatsModal';

interface ChatMessageProps {
  message: Message;
  currentUser?: CurrentUser;
  friendName?: string;
}

export const ChatMessage = ({
  message,
  currentUser,
  friendName,
}: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const isAdmin = currentUser?.isAdmin || false;
  const [showStatsModal, setShowStatsModal] = useState<string | null>(null);
  const handleStatsClick = async () => {
    if (!isUser) {
      setShowStatsModal(message.id);
    }
  };

  const closeStatsModal = () => {
    setShowStatsModal(null);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex max-w-[90%] sm:max-w-[90%] md:max-w-[70%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        } space-x-2`}
      >
        {isUser ? null : (
          <div className={`flex-shrink-0 pl-2 ${isUser ? 'ml-2' : 'mr-2'}`}>
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center`}
            >
              <span className="text-primary-foreground text-sm font-medium">
                {friendName?.charAt(0).toUpperCase() || 'B'}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          {!isUser && friendName && (
            <span className="text-xs text-gray-500 mb-1">{friendName}</span>
          )}

          <div
            className={`rounded-2xl px-4 py-3 relative ${
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-message-bg text-foreground'
            }`}
          >
            {!isUser && isAdmin && (
              <button
                onClick={handleStatsClick}
                className="absolute top-2 right-2 text-muted-foreground hover:text-primary transition-all duration-200 p-1.5 rounded-full hover:bg-primary-soft group"
                title="워크플로우 통계 보기"
              >
                <svg
                  className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </button>
            )}

            <div
              className={`text-sm leading-relaxed text-pretty break-all text-left ${
                isUser || 'pr-5'
              } [&>p]:mb-2 [&>p:last-child]:mb-0 [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-medium [&>code]:text-xs [&>pre]:text-xs`}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(parseSimpleMarkdown(message.content)),
              }}
            />
            <p
              className={`text-[10px] mt-2 ${
                isUser
                  ? 'text-primary-soft text-right'
                  : 'text-muted-foreground'
              }`}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      {showStatsModal && (
        <WorkflowStatsModal
          messageId={showStatsModal}
          onClose={closeStatsModal}
        />
      )}
    </div>
  );
};
