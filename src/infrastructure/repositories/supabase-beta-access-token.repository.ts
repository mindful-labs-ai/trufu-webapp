import { IBetaAccessTokenRepository } from '@/domain/interfaces/beta-access.interfaces';
import {
  CreateTokenRequest,
  TokenValidationResult,
  UseTokenRequest,
} from '@/types/beta-access';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseBetaAccessTokenRepository
  implements IBetaAccessTokenRepository
{
  constructor(private supabase: SupabaseClient) {}

  /**
   * 토큰을 검증합니다
   */
  async validateToken(
    authToken: string
  ): Promise<TokenValidationResult | null> {
    try {
      const { data, error } = await this.supabase.rpc(
        'validate_beta_access_token',
        { token_input: authToken }
      );

      if (error) {
        console.error('Token validation error:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const result = data[0];
      return {
        tokenId: result.token_id,
        jwtToken: result.jwt_token,
        userId: result.user_id,
        isValid: result.is_valid,
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }

  /**
   * 토큰을 사용 처리합니다
   */
  async useToken(request: UseTokenRequest): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('use_beta_access_token', {
        token_input: request.authToken,
        using_user_id: request.userId,
      });

      if (error) {
        console.error('Token usage error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Token usage failed:', error);
      return false;
    }
  }

  /**
   * 토큰을 생성합니다 (관리자용)
   */
  async createToken(request: CreateTokenRequest): Promise<string> {
    try {
      const { data, error } = await this.supabase.rpc(
        'create_beta_access_token',
        {
          auth_token_input: request.authToken,
          jwt_token_input: request.jwtToken,
          user_id_input: request.userId,
          expires_in_days: request.expiresInDays || 30,
        }
      );

      if (error) {
        throw new Error(`Token creation failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Token creation failed:', error);
      throw error;
    }
  }

  /**
   * 베타 사용자를 Supabase에 생성합니다 (Admin API 사용)
   */
  async createBetaUser(
    userId: string,
    email: string,
    jwtToken: string
  ): Promise<boolean> {
    try {
      // Supabase Admin API를 사용하여 사용자 생성
      const { data, error } = await this.supabase.auth.admin.createUser({
        id: userId,
        email: email,
        email_confirm: true,
        user_metadata: {
          beta_access: true,
          provider: 'beta-access',
        },
        app_metadata: {
          provider: 'beta-access',
          providers: ['beta-access'],
        },
      });

      if (error) {
        console.error('Beta user creation failed:', error);
        return false;
      }

      console.log('Beta user created successfully:', {
        userId: data.user.id,
        email: data.user.email,
      });
      return true;
    } catch (error) {
      console.error('Beta user creation error:', error);
      return false;
    }
  }
}
