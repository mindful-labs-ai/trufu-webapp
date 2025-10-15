export const QUERY_KEY = {
  CHAT: ({ userId, botId }: { userId: string; botId: string }) => [
    'CHAT_HISTORY',
    `${userId}`,
    `${botId}`,
  ],
  FRIENDS: () => ['FRIENDS_LIST'],
};
