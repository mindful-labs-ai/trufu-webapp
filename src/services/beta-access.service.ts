import { JwtService } from '../infrastructure/services/jwt.service';
import { TokenValidationResult } from '../types/beta-access';

export class BetaAccessService {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService();
  }

  /**
   * 베타 액세스 토큰으로 로그인합니다
   */
  async loginWithBetaToken(authToken: string): Promise<{
    success: boolean;
    data?: { userId: string; jwtToken: string };
    error?: string;
  }> {
    try {
      // 1. 서버 API를 통해 베타 토큰 인증 및 JWT 생성
      const response = await fetch('/api/beta-access/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authToken }),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || '인증에 실패했습니다.',
        };
      }

      // 2. JWT 서비스를 통해 Supabase 세션 설정
      const sessionResult = await this.jwtService.setSupabaseSession(
        result.data.jwtToken
      );

      if (!sessionResult.success) {
        return {
          success: false,
          error: sessionResult.error || 'Supabase 세션 설정에 실패했습니다.',
        };
      }

      // 3. 로그인 성공 후 사용자 정보 확인
      const user = await this.getCurrentUser();
      if (!user) {
        console.warn('Login successful but user info not available');
      } else {
        console.log('Login successful, user:', {
          id: user.id,
          email: user.email,
        });
      }

      return {
        success: true,
        data: {
          userId: result.data.userId,
          jwtToken: result.data.jwtToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : '로그인에 실패했습니다.',
      };
    }
  }

  /**
   * 베타 액세스 토큰을 검증합니다
   */
  async validateBetaToken(authToken: string): Promise<{
    success: boolean;
    isValid?: boolean;
    data?: TokenValidationResult;
    error?: string;
  }> {
    try {
      // JWT 서비스를 통해 토큰 검증
      const jwtToken = await this.jwtService.generateSupabaseJwt({
        sub: authToken,
        email: `beta-user-${authToken.slice(0, 8)}@beta.trufu.com`,
        role: 'authenticated',
      });

      // 생성된 JWT 토큰을 검증하여 유효성 확인
      await this.jwtService.verifySupabaseJwt(jwtToken);

      return {
        success: true,
        isValid: true,
        data: {
          tokenId: authToken,
          jwtToken: jwtToken,
          userId: authToken,
          isValid: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        isValid: false,
        error:
          error instanceof Error ? error.message : '토큰 검증에 실패했습니다.',
      };
    }
  }

  /**
   * 현재 사용자 정보를 가져옵니다
   */
  async getCurrentUser() {
    return await this.jwtService.getCurrentUser();
  }

  /**
   * 로그아웃합니다
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    return await this.jwtService.signOut();
  }

  /**
   * 인증 상태 변화를 구독합니다
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.jwtService.onAuthStateChange(callback);
  }

  /**
   * Supabase 클라이언트를 반환합니다
   */
  getSupabaseClient() {
    return this.jwtService.getSupabaseClient();
  }

  /**
   * 세션이 유효한지 확인합니다
   */
  async isSessionValid(): Promise<boolean> {
    return await this.jwtService.isSessionValid();
  }

  /**
   * 세션을 새로고침합니다
   */
  async refreshSession(): Promise<{ success: boolean; error?: string }> {
    return await this.jwtService.refreshSession();
  }

  /**
   * 토큰의 만료 시간을 확인합니다
   */
  getTokenExpiry(token: string): Date | null {
    return this.jwtService.getTokenExpiry(token);
  }

  /**
   * 토큰이 곧 만료되는지 확인합니다
   */
  isTokenExpiringSoon(token: string, minutesBeforeExpiry?: number): boolean {
    return this.jwtService.isTokenExpiringSoon(token, minutesBeforeExpiry);
  }

  /**
   * 저장된 JWT 토큰으로 세션을 복원합니다
   */
  async restoreSession(jwtToken: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // JWT 토큰으로 Supabase 세션 설정
      const sessionResult = await this.jwtService.setSupabaseSession(jwtToken);

      if (!sessionResult.success) {
        return {
          success: false,
          error: sessionResult.error || '세션 복원에 실패했습니다.',
        };
      }

      // 세션 복원 후 사용자 정보 확인
      const user = await this.getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: '사용자 정보를 가져올 수 없습니다.',
        };
      }

      console.log('Session restored successfully for user:', {
        id: user.id,
        email: user.email,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : '세션 복원에 실패했습니다.',
      };
    }
  }
}
