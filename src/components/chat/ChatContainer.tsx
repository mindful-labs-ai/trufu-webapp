'use client';

import { useChat } from '@/hooks/useChat';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useFriendStore } from '@/stores/friendStore';
import { CurrentUser } from '@/stores/userStore';
import { useEffect } from 'react';
import { ChatContainerHeader } from './ChatContainerHeader';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { DateSeparator } from './DateSeparator';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '@/constants/queryKeys';
import { Friend } from '@/types/friend';
import { CHAT_BOT_IMAGE, CHAT_BOT_PROFILE } from '@/constants/chatBotImage';
import { CHAT_BOT } from '@/constants/chatBotIdMapping';
import { resetUnreadCount } from '@/utils/messageCache';
import { updateLastReadAt } from '@/services/unread.service';
import { UnreadSummary } from '@/types/unread';

interface ChatContainerProps {
  user: CurrentUser;
}

export const ChatContainer = ({ user }: ChatContainerProps) => {
  const { selectedFriend, selectFriend } = useFriendStore();
  const queryClient = useQueryClient();

  const allFriends = queryClient.getQueryData<Friend[]>(QUERY_KEY.FRIENDS());
  const conversations = queryClient.getQueryData<UnreadSummary[]>(
    QUERY_KEY.UNREAD(user.id)
  );

  const {
    messages,
    isLoading,
    isLoadingHistory,
    historyError,
    sendMessage,
    isReady,
    hasCredit,
    isLoadingCredit,
  } = useChat(
    user.id.toString(),
    selectedFriend?.id || null,
    selectedFriend?.agent_code || null
  );

  const {
    messagesEndRef,
    chatContainerRef,
    isUserScrolling,
    shouldAutoScroll,
    scrollToBottom,
    setShouldAutoScroll,
    handleScroll,
  } = useAutoScroll(messages.length, isLoadingHistory);

  useEffect(() => {
    if (selectedFriend?.id && user.id) {
      const unreadSummaryForBot = conversations?.find(
        conversation =>
          Number(conversation.bot_id) === Number(selectedFriend.id)
      );
      const hasUnreadInFriends = allFriends?.some(
        friend => friend.id === selectedFriend.id && friend.has_unread
      );
      const hasUnreadInSummary =
        unreadSummaryForBot && unreadSummaryForBot.unread_count > 0;

      resetUnreadCount(queryClient, selectedFriend.id, user.id);

      if (hasUnreadInFriends || hasUnreadInSummary) {
        updateLastReadAt(user.id.toString(), selectedFriend.id);
      }
    }
  }, [selectedFriend?.id, user.id, queryClient, allFriends, conversations]);

  const friendId = selectedFriend?.id ? Number(selectedFriend.id) : undefined;
  const bottomImage = CHAT_BOT_IMAGE(friendId);
  const profileImage = CHAT_BOT_PROFILE(friendId);

  const handleSendMessage = async (message: string) => {
    setShouldAutoScroll(true);
    await sendMessage(message);

    setTimeout(() => {
      scrollToBottom();
    }, 300);
  };

  useEffect(() => {
    setShouldAutoScroll(true);
    setTimeout(() => {
      scrollToBottom(true);
    }, 300);
  }, [selectedFriend?.id, setShouldAutoScroll, scrollToBottom]);

  if (!selectedFriend) {
    const featuredChatbotIds = [CHAT_BOT.DOPO, CHAT_BOT.Ebook] as unknown[];

    const featuredFriends = allFriends?.filter(friend =>
      featuredChatbotIds.includes(friend.id)
    );

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-3xl w-full">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            💬
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            대화 시작하기
          </h2>
          <p className="text-muted-foreground mb-8">
            대화할 친구를 선택해주세요!
          </p>

          {featuredFriends && featuredFriends.length > 0 && (
            <div className="flex gap-4 px-4 items-center">
              {featuredFriends.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => selectFriend(friend)}
                  className="relative flex flex-1 flex-col gap-2 items-center p-4 rounded-lg border border-border active:bg-muted transition-all group"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="text-2xl text-primary-foreground">
                      {friend.name?.charAt(0).toUpperCase() || '💬'}
                    </span>
                  </div>
                  <span className="text-md font-medium text-foreground group-hover:scale-110 transition-transform">
                    {friend.name}
                  </span>
                  {friend.has_unread && (
                    <div className="absolute top-3 translate-x-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-600 text-primary-foreground">
                        {friend.unread_count || 0}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {selectedFriend.has_affinity && messages.length > 0 && (
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
        className="flex-1 overflow-y-auto p-4 pb-0 space-y-4"
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
                {profileImage ? (
                  <img
                    className="rounded-full object-cover"
                    src={profileImage.src}
                    alt={profileImage.alt}
                  />
                ) : (
                  selectedFriend?.name?.charAt(0)
                )}
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
          <div className="flex flex-col flex-1 max-w-[720px] mx-auto gap-y-4">
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
                    friendId={selectedFriend?.id}
                  />
                </div>
              );
            })}
            {isLoading && (
              <div className="flex flex-row space-x-2 justify-start">
                <div className="flex-shrink-0 pl-2 mr-2">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center`}
                  >
                    <span className="text-primary-foreground text-sm font-medium">
                      {profileImage ? (
                        <img
                          className="rounded-full object-cover"
                          src={profileImage.src}
                          alt={profileImage.alt}
                        />
                      ) : (
                        selectedFriend?.name?.charAt(0)
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">
                    {selectedFriend?.name}
                  </span>
                  <div className="bg-message-bg rounded-2xl px-4 py-3 max-w-xs lg:max-w-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className={`${bottomImage && 'pb-40'}`} />
            <div ref={messagesEndRef} style={{ height: '16px' }} />
          </div>
        )}
        {!isLoadingHistory && messages.length === 0 && (
          <div ref={messagesEndRef} />
        )}
      </div>

      <div className="absolute bottom-4 w-72 h-72 left-1/2 -translate-x-1/2 pointer-events-none z-0">
        {bottomImage && (
          <img
            src={bottomImage.src}
            alt={bottomImage.alt}
            className="w-full h-full scale-75 md:scale-100 object-contain"
          />
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
            isLoading ||
            isLoadingHistory ||
            !selectedFriend ||
            !isReady ||
            !hasCredit ||
            isLoadingCredit
          }
          placeholder={
            isLoadingCredit
              ? '크레딧 정보를 확인하는 중...'
              : !hasCredit
              ? '크레딧이 모두 소진되었습니다.'
              : undefined
          }
        />
      </div>
    </div>
  );
};
