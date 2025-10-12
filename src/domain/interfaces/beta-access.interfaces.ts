import {
  BetaAccessToken,
  CreateTokenRequest,
  TokenValidationResult,
  UseTokenRequest,
} from '@/types/beta-access';

export interface IBetaAccessTokenRepository {
  validateToken(authToken: string): Promise<TokenValidationResult | null>;
  useToken(request: UseTokenRequest): Promise<boolean>;

  // 이하 관리자 용
  createToken(request: CreateTokenRequest): Promise<string>;
  createBetaUser(
    userId: string,
    email: string,
    jwtToken: string
  ): Promise<boolean>;
}

export interface IJwtService {
  generateSupabaseJwt(payload: {
    sub: string;
    email?: string;
    role?: string;
    exp?: number;
  }): Promise<string>;

  verifySupabaseJwt(token: string): Promise<any>;
}

export interface ITokenGenerator {
  generateAuthToken(length?: number): string;
  generateUuid(): string;
}
