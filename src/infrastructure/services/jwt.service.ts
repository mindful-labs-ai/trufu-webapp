import { IJwtService } from '@/domain/interfaces/beta-access.interfaces';
import jwt from 'jsonwebtoken';
import { CustomSupabaseClient } from '../supabase/custom-supabase-client';

export class JwtService implements IJwtService {
  private readonly supabaseJwtSecret: string;
  private readonly issuer: string = 'supabase';
  private readonly kid: string = 'StWgvhVYQ0u';
  private supabaseClient: CustomSupabaseClient;

  constructor() {
    this.supabaseJwtSecret = process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET!;
    this.supabaseClient = new CustomSupabaseClient();

    if (!this.supabaseJwtSecret) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_JWT_SECRET environment variable is required'
      );
    }
  }

  async generateSupabaseJwt(payload: {
    sub: string;
    email?: string;
    role?: string;
    exp?: number;
  }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    const jwtHeader = {
      typ: 'JWT',
      alg: 'HS256',
      kid: this.kid,
    };

    // ref: https://supabase.com/docs/guides/auth/jwt-fields#required-claims
    const jwtPayload = {
      iss: this.issuer,
      sub: payload.sub,
      aud: 'authenticated',
      iat: now,
      exp: payload.exp || now + 60 * 60 * 24 * 30, // 기본 30일
      role: payload.role || 'authenticated',
      aal: 'aal1',
      email:
        payload.email || `beta-user-${payload.sub.slice(0, 8)}@beta.trufu.com`,
      phone: '',
      app_metadata: {
        provider: 'beta',
        providers: ['beta'],
      },
      user_metadata: {
        beta_user: true,
      },
    };

    return jwt.sign(jwtPayload, this.supabaseJwtSecret, {
      header: jwtHeader,
    });
  }

  /**
   * Supabase JWT 토큰을 검증
   */
  async verifySupabaseJwt(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.supabaseJwtSecret, {
        algorithms: ['HS256'],
      });
    } catch (error) {
      throw new Error(
        `JWT verification failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * JWT 토큰으로 Supabase 세션을 설정
   */
  async setSupabaseSession(jwtToken: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    return await this.supabaseClient.setAuthWithJWT(jwtToken);
  }

  /**
   * 현재 Supabase 사용자를 가져옴
   */
  async getCurrentUser() {
    return await this.supabaseClient.getCurrentUser();
  }

  /**
   * Supabase 세션에서 로그아웃
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    return await this.supabaseClient.signOut();
  }

  /**
   * Supabase 인증 상태 변화를 구독
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabaseClient.onAuthStateChange(callback);
  }

  /**
   * Supabase 클라이언트 반환
   */
  getSupabaseClient() {
    return this.supabaseClient.getClient();
  }

  /**
   * 베타 액세스 토큰으로 인증하고 Supabase 세션을 설정
   */
  async authenticateWithBetaToken(betaToken: string): Promise<{
    success: boolean;
    data?: { userId: string; jwtToken: string };
    error?: string;
  }> {
    try {
      const jwtToken = await this.generateSupabaseJwt({
        sub: betaToken, // 실제로는 베타 토큰으로부터 추출된 사용자 ID
        email: `beta-user-${betaToken.slice(0, 8)}@beta.trufu.com`,
        role: 'authenticated',
      });

      const sessionResult = await this.setSupabaseSession(jwtToken);
      if (!sessionResult.success) {
        return {
          success: false,
          error: sessionResult.error || 'Supabase 세션 설정에 실패했습니다.',
        };
      }

      return {
        success: true,
        data: {
          userId: betaToken,
          jwtToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '인증에 실패했습니다.',
      };
    }
  }

  /**
   * 현재 세션이 유효한지 확인
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  /**
   * 세션을 새로고침합니다
   */
  async refreshSession(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabaseClient
        .getClient()
        .auth.refreshSession();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '세션 새로고침에 실패했습니다.',
      };
    }
  }

  /**
   * 토큰의 만료 시간을 확인합니다
   */
  getTokenExpiry(token: string): Date | null {
    try {
      const [, payload] = token.split('.');
      const decodedPayload = JSON.parse(atob(payload));

      if (decodedPayload.exp) {
        return new Date(decodedPayload.exp * 1000);
      }

      return null;
    } catch (error) {
      console.error('Failed to parse token expiry:', error);
      return null;
    }
  }

  /**
   * 토큰이 곧 만료되는지 확인합니다 (기본 5분 전)
   */
  isTokenExpiringSoon(token: string, minutesBeforeExpiry: number = 5): boolean {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) return false;

    const now = new Date();
    const threshold = new Date(now.getTime() + minutesBeforeExpiry * 60 * 1000);

    return expiry <= threshold;
  }

  /**
   * 베타 환경용 JWT 테스트 메서드
   */
  async testJwtGeneration(userId: string = 'test-user'): Promise<{
    success: boolean;
    jwtToken?: string;
    decodedPayload?: any;
    error?: string;
  }> {
    try {
      // JWT 생성
      const jwtToken = await this.generateSupabaseJwt({
        sub: userId,
        email: `beta-user-${userId}@beta.trufu.com`,
        role: 'authenticated',
      });

      // JWT 파싱
      const [, payload] = jwtToken.split('.');
      const decodedPayload = JSON.parse(atob(payload));

      // JWT 검증
      await this.verifySupabaseJwt(jwtToken);

      return {
        success: true,
        jwtToken,
        decodedPayload,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'JWT test failed',
      };
    }
  }
}
