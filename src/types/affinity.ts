export interface Affinity {
  id: number;
  bot_id: string;
  user_id: string;
  affinity: number;
  affinity_progress: number; // 0-100
  created_at: string;
  updated_at: string;
}

export interface AffinityLevelInfo {
  level: number;
  name: string;
  description: string;
  color: string;
  emoji: string;
}

export const AFFINITY_LEVELS: Record<number, AffinityLevelInfo> = {
  1: {
    level: 1,
    name: '아는 사람',
    description: '보통 얘기를 들어주는 포지션',
    color: 'bg-gray-100 text-gray-700',
    emoji: '👋',
  },
  2: {
    level: 2,
    name: '그냥 친구',
    description: '필요한 말을 해주는 관계',
    color: 'bg-blue-100 text-blue-700',
    emoji: '😊',
  },
  3: {
    level: 3,
    name: '친한 친구',
    description: '웃긴 얘기나 개그, 다정함 탑재',
    color: 'bg-green-100 text-green-700',
    emoji: '😄',
  },
  4: {
    level: 4,
    name: '찐 친구',
    description: '진심어린 공감과 격려',
    color: 'bg-purple-100 text-purple-700',
    emoji: '💖',
  },
};
