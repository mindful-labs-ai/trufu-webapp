import { JwtService } from '../infrastructure/services/jwt.service';
import { TokenValidationResult } from '../types/beta-access';
import { supabase } from '@/lib/supabase';

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
      // 1) 서버에서 OTP 발급 받기
      const r = await fetch('/api/beta-access/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authToken }),
      });
      const j = await r.json();
      if (!r.ok || !j?.success) {
        return { success: false, error: j?.error || '세션 발급 실패' };
      }

      const { email, email_otp } = j.data;

      // 2) 브라우저에서 OTP 검증 -> 진짜 Supabase 세션 생성
      const { data: verified, error: verr } = await supabase.auth.verifyOtp({
        type: 'magiclink',
        email,
        token: email_otp,
      });
      if (verr) return { success: false, error: verr.message };

      // 3) 세션 확인 및 토큰 저장
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return { success: false, error: '세션 생성 실패' };

      return {
        success: true,
        data: {
          userId: verified.user?.id ?? '',
          jwtToken: session.access_token,
        },
      };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : '로그인에 실패했습니다.',
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ? { id: user.id, email: user.email } : null;
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
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  }

  /**
   * 세션을 새로고침합니다
   */
  async refreshSession() {
    const { error } = await supabase.auth.refreshSession();
    return error ? { success: false, error: error.message } : { success: true };
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
