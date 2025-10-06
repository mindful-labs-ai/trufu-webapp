export interface User {
  id: number;
  login_method: string;
  email: string;
  nickname?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

// 레거시 테스트 데이터 (DB 사용 시 더 이상 필요하지 않음)
// 만약 DB에 데이터가 없는 경우 아래 SQL을 실행하세요:
/*
INSERT INTO public.users (login_method, email, nickname, avatar) VALUES 
  ('email', 'user1@example.com', 'User 1', '👤'),
  ('email', 'user2@example.com', 'User 2', '👨'),
  ('email', 'user3@example.com', 'User 3', '👩'),
  ('email', 'user4@example.com', 'User 4', '🧑'),
  ('email', 'user5@example.com', 'User 5', '👶');
*/
