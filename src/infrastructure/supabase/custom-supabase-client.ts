import { SupabaseClient, createClient } from '@supabase/supabase-js';

export class CustomSupabaseClient {
  private client: SupabaseClient;
  private supabaseUrl: string;
  private currentJwtToken: string | null = null;
  private readonly JWT_STORAGE_KEY = 'trufu-beta-jwt-token';

  constructor(
    supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabaseUrl = supabaseUrl;
    this.client = createClient(supabaseUrl, supabaseKey);
    this.restoreJwtFromStorage();
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * localStorage에서 JWT 토큰을 복원합니다
   */
  private restoreJwtFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedToken = localStorage.getItem(this.JWT_STORAGE_KEY);
      if (storedToken) {
        // 토큰 만료 확인
        const [, payload] = storedToken.split('.');
        const decodedPayload = JSON.parse(atob(payload));

        if (
          decodedPayload.exp &&
          decodedPayload.exp > Math.floor(Date.now() / 1000)
        ) {
          // 토큰이 유효하면 복원
          this.currentJwtToken = storedToken;
          this.setupClientWithJwt(storedToken);
          console.log('JWT token restored from storage');
        } else {
          // 만료된 토큰 제거
          localStorage.removeItem(this.JWT_STORAGE_KEY);
          console.log('Expired JWT token removed from storage');
        }
      }
    } catch (error) {
      console.error('Failed to restore JWT from storage:', error);
      localStorage.removeItem(this.JWT_STORAGE_KEY);
    }
  }

  /**
   * JWT 토큰을 localStorage에 저장합니다
   */
  private saveJwtToStorage(token: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.JWT_STORAGE_KEY, token);
    } catch (error) {
      console.error('Failed to save JWT to storage:', error);
    }
  }

  /**
   * localStorage에서 JWT 토큰을 제거합니다
   */
  private removeJwtFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.JWT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove JWT from storage:', error);
    }
  }

  /**
   * JWT 토큰으로 클라이언트를 설정합니다
   */
  private setupClientWithJwt(jwtToken: string): void {
    this.client = createClient(
      this.supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  /**
   * JWT 토큰으로 Supabase 인증을 설정합니다
   */
  async setAuthWithJWT(jwtToken: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // JWT 토큰 파싱
      const [header, payload, signature] = jwtToken.split('.');
      const decodedPayload = JSON.parse(atob(payload));

      // 만료 시간 확인
      if (
        decodedPayload.exp &&
        decodedPayload.exp < Math.floor(Date.now() / 1000)
      ) {
        return {
          success: false,
          error: 'Token has expired',
        };
      }

      // JWT 토큰 저장 (메모리 + localStorage)
      this.currentJwtToken = jwtToken;
      this.saveJwtToStorage(jwtToken);

      // 클라이언트를 JWT 토큰으로 설정
      this.setupClientWithJwt(jwtToken);

      console.log('Beta access authentication configured and saved');

      return { success: true };
    } catch (error) {
      console.error('Auth setup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * 현재 인증 상태를 확인합니다
   */
  async getCurrentUser() {
    try {
      // JWT 토큰이 있으면 직접 파싱해서 사용자 정보 반환
      if (this.currentJwtToken) {
        const [, payload] = this.currentJwtToken.split('.');
        const decodedPayload = JSON.parse(atob(payload));

        // 토큰 만료 확인
        if (
          decodedPayload.exp &&
          decodedPayload.exp < Math.floor(Date.now() / 1000)
        ) {
          console.warn('JWT token expired');
          this.currentJwtToken = null; // 만료된 토큰 정리
          return null;
        }

        // JWT에서 사용자 정보 구성
        return {
          id: decodedPayload.sub,
          email: decodedPayload.email,
          role: decodedPayload.role,
          aud: decodedPayload.aud,
          app_metadata: decodedPayload.app_metadata || {},
          user_metadata: decodedPayload.user_metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      // JWT가 없으면 null 반환 (Supabase Auth API 호출하지 않음)
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * 인증을 해제합니다
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      // JWT 토큰 정리 (메모리 + localStorage)
      this.currentJwtToken = null;
      this.removeJwtFromStorage();

      // 새로운 클라이언트 인스턴스로 재설정 (JWT 헤더 없이)
      this.client = createClient(
        this.supabaseUrl,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Supabase auth signOut 호출
      const { error } = await this.client.auth.signOut();

      if (error) {
        console.warn('Supabase signOut warning:', error.message);
        // 경고는 로그하지만 성공으로 처리 (베타 환경용)
      }

      console.log('Signed out and cleared stored JWT token');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      };
    }
  }

  /**
   * 인증 상태 변화를 구독합니다
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.client.auth.onAuthStateChange(callback);
  }
}
