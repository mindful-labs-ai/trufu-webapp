export interface Friend {
  id: string;
  title: string;
  botId: string;
  description: string;
  avatar?: string;
  isDefault?: boolean;
}

export const DEFAULT_FRIENDS: Friend[] = [
  {
    id: '1',
    title: 'Dopo',
    botId: '1',
    description: 'Your best friend',
    isDefault: true,
  },
  {
    id: '2',
    title: 'Tufu',
    botId: '68ad2441859f3f4c31d3f236',
    description: 'Your second best friend',
  },
  {
    id: '3',
    title: 'Keke',
    botId: '2',
    description: 'Who are you',
  },
  {
    id: '4',
    title: 'Yuju',
    botId: '3',
    description: 'Who am I...',
  },
];

export const getDefaultFriend = (): Friend => {
  return DEFAULT_FRIENDS.find(f => f.isDefault) || DEFAULT_FRIENDS[0];
};
