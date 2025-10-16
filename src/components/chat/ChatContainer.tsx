'use client';

import { useChat } from '@/hooks/useChat';
import { useFriendStore } from '@/stores/friendStore';
import { useEffect, useRef, useState } from 'react';
import { ChatContainerHeader } from './ChatContainerHeader';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { DateSeparator } from './DateSeparator';
import { CurrentUser } from '@/stores/userStore';

interface ChatContainerProps {
  user: CurrentUser;
}

export const ChatContainer = ({ user }: ChatContainerProps) => {
  const { selectedFriend } = useFriendStore();

  const {
    messages,
    isLoading,
    isLoadingHistory,
    historyError,
    sendMessage,
    isReady,
  } = useChat(user.id.toString(), selectedFriend?.id || null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = (force = false) => {
    if (shouldAutoScroll || force) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px 여유

      setShouldAutoScroll(isAtBottom);

      if (!isAtBottom) {
        setIsUserScrolling(true);
      } else {
        setIsUserScrolling(false);
      }
    }
  };

  useEffect(() => {
    if (!isLoadingHistory) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoading, isLoadingHistory]);

  useEffect(() => {
    if (!isLoadingHistory && messages.length > 0) {
      scrollToBottom();
    }
  }, [isLoadingHistory]);

  const handleSendMessage = async (message: string) => {
    setShouldAutoScroll(true);
    await sendMessage(message);

    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setShouldAutoScroll(true);
    }
  }, [selectedFriend]);

  if (!selectedFriend) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            💬
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            대화 시작하기
          </h2>
          <p className="text-muted-foreground max-w-md">
            왼쪽에서 대화할 친구를 선택해주세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {selectedFriend && messages.length > 0 && (
        <div className="border-b border-border p-3 bg-card">
          <ChatContainerHeader
            user={user}
            chatbot={selectedFriend}
            messageCount={messages.length}
          />
        </div>
      )}

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 pb-32 space-y-4"
        onScroll={handleScroll}
      >
        {historyError && (
          <div className="mb-4">
            <div className="bg-muted border border-border rounded-lg p-3">
              <div className="flex">
                <div className="text-muted-foreground">⚠️</div>
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">
                    {historyError}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-card"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                대화 기록 불러오는 중...
              </h2>
              <p className="text-muted-foreground max-w-md">
                이전 대화 내용을 불러오고 있습니다.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 text-primary-foreground bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                {selectedFriend?.name?.charAt(0) || '💬'}
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {selectedFriend
                  ? `${selectedFriend.name}와 대화하기`
                  : '대화 시작'}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {selectedFriend
                  ? '아래에 메시지를 입력하여 대화를 시작해보세요.'
                  : '대화할 친구를 선택해주세요.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-[720px] mx-auto space-y-4">
            {messages.map((message, index) => {
              const showDateSeparator =
                index === 0 ||
                (index > 0 &&
                  new Date(messages[index - 1].timestamp).toDateString() !==
                    new Date(message.timestamp).toDateString());

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <DateSeparator date={message.timestamp} />
                  )}
                  <ChatMessage
                    message={message}
                    currentUser={user}
                    friendName={selectedFriend?.name}
                  />
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs lg:max-w-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        {!isLoadingHistory && messages.length === 0 && (
          <div ref={messagesEndRef} />
        )}
      </div>

      <div className="relative">
        {isUserScrolling && !shouldAutoScroll && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={() => {
                setShouldAutoScroll(true);
                scrollToBottom(true);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-2 shadow-md transition-colors"
              title="맨 아래로 이동"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
          </div>
        )}

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={
            isLoading || isLoadingHistory || !selectedFriend || !isReady
          }
        />
      </div>
    </div>
  );
};
