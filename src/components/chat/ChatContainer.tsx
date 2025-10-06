'use client';

import { useChat } from '@/hooks/useChat';
import { useSelectedFriend } from '@/hooks/useSelectedFriend';
import { User } from '@/types/user';
import { useState } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { DateSeparator } from './DateSeparator';
import { FriendSelectionModal } from './FriendSelectionModal';

interface ChatContainerProps {
  user: User;
}

export const ChatContainer = ({ user }: ChatContainerProps) => {
  const {
    selectedFriend,
    selectFriend,
    availableFriends,
    isLoading: isFriendLoading,
  } = useSelectedFriend();

  const {
    messages,
    isLoading,
    isLoadingHistory,
    historyError,
    sendMessage,
    isReady,
  } = useChat(user.id.toString(), selectedFriend?.botId || null);

  const [showFriendSelection, setShowFriendSelection] = useState(false);
  if (!isFriendLoading && !selectedFriend) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            초기화 중...
          </h2>
          <p className="text-gray-600 max-w-md">
            대화할 친구를 먼저 선택해주세요!
          </p>
        </div>
      </div>
    );
  }

  if (isFriendLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            초기화 중...
          </h2>
          <p className="text-gray-600 max-w-md">
            대화 환경을 준비하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {historyError && (
          <div className="mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex">
                <div className="text-yellow-400">⚠️</div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{historyError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                대화 기록 불러오는 중...
              </h2>
              <p className="text-gray-600 max-w-md">
                이전 대화 내용을 불러오고 있습니다.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {selectedFriend?.title.charAt(0) || '💬'}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {selectedFriend
                  ? `${selectedFriend.title}와 대화하기`
                  : '대화 시작'}
              </h2>
              <p className="text-gray-600 max-w-md">
                {selectedFriend
                  ? `${selectedFriend.description}. 아래에 메시지를 입력하여 대화를 시작해보세요.`
                  : '대화할 친구를 선택해주세요.'}
              </p>
              {selectedFriend && (
                <div className="mt-4 text-sm text-gray-500">
                  💡 Bot ID: {selectedFriend.botId}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
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
                  <ChatMessage message={message} currentUser={user} />
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
          </div>
        )}
      </div>

      <ChatInput
        onSendMessage={sendMessage}
        disabled={isLoading || isLoadingHistory || !selectedFriend || !isReady}
      />

      {/* Friend Selection Modal */}
      <FriendSelectionModal
        isOpen={showFriendSelection}
        onClose={() => setShowFriendSelection(false)}
        onSelectFriend={friend => {
          selectFriend(friend);
          setShowFriendSelection(false);
        }}
        availableFriends={availableFriends}
        selectedFriend={selectedFriend}
      />
    </div>
  );
};
