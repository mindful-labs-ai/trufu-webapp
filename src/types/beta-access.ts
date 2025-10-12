// 베타 액세스 토큰 엔티티
export interface BetaAccessToken {
  id: string;
  authToken: string; // 사용자에게 보낼 인증 토큰 (예: eGSe9Dwg52k)
  jwtToken: string; // Supabase JWT 시크릿으로 생성한 사용자용 JWT
  userId?: string; // 할당된 사용자 ID
  isUsed: boolean; // 토큰 사용 여부
  expiresAt: Date; // 토큰 만료 시간
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // 토큰을 생성한 관리자 ID
}

// 토큰 검증 결과
export interface TokenValidationResult {
  tokenId: string;
  jwtToken: string;
  userId?: string;
  isValid: boolean;
}

// 토큰 생성 요청
export interface CreateTokenRequest {
  authToken: string;
  jwtToken: string;
  userId: string;
  expiresInDays?: number;
}

// 토큰 사용 요청
export interface UseTokenRequest {
  authToken: string;
  userId: string;
}

// 베타 액세스 인증 상태
export interface BetaAccessAuthState {
  isAuthenticated: boolean;
  token?: BetaAccessToken;
  user?: {
    id: string;
    email?: string;
  };
}
