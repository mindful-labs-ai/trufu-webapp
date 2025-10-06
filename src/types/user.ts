export interface User {
  id: number;
  login_method: string;
  email: string;
  created_at: string;
  updated_at: string;
  // 표시용 속성들
  displayName?: string;
  avatar?: string;
}

// 테스트용 사용자 데이터
export const TEST_USERS: User[] = [
  {
    id: 1,
    login_method: 'email',
    email: 'user1@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    displayName: 'User 1',
    avatar: '👤',
  },
  {
    id: 2,
    login_method: 'email',
    email: 'user2@example.com',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    displayName: 'User 2',
    avatar: '👨',
  },
  {
    id: 3,
    login_method: 'email',
    email: 'user3@example.com',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    displayName: 'User 3',
    avatar: '👩',
  },
  {
    id: 4,
    login_method: 'email',
    email: 'user4@example.com',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
    displayName: 'User 4',
    avatar: '🧑',
  },
  {
    id: 5,
    login_method: 'email',
    email: 'user5@example.com',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
    displayName: 'User 5',
    avatar: '👶',
  },
];

export const DEFAULT_USER = TEST_USERS[0];
