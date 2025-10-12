import { BetaAccessToken, TokenValidationResult } from '@/types/beta-access';
import {
  IBetaAccessTokenRepository,
  IJwtService,
  ITokenGenerator,
} from '../interfaces/beta-access.interfaces';

export class BetaAccessTokenService {
  constructor(
    private betaAccessRepository: IBetaAccessTokenRepository,
    private jwtService: IJwtService,
    private tokenGenerator: ITokenGenerator
  ) {}

  /**
   * 베타 액세스 토큰을 생성 (관리자용)
   * 1. 인증토큰(auth_token) 생성
   * 2. Supabase에 실제 사용자 생성
   * 3. 생성된 사용자 ID로 JWT 발급
   * 4. 데이터베이스에 저장
   */
  async createBetaAccessToken(
    expiresInDays: number = 30,
    userEmail?: string
  ): Promise<{ authToken: string; tokenId: string }> {
    const authToken = this.tokenGenerator.generateAuthToken(12);

    const userId = this.tokenGenerator.generateUuid();
    const email = userEmail || `beta-${userId.slice(0, 8)}@trufu.beta`;

    const userCreated = await this.betaAccessRepository.createBetaUser(
      userId,
      email,
      ''
    );
    if (!userCreated) {
      throw new Error('Failed to create beta user in Supabase');
    }

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      sub: userId,
      email: email,
      role: 'authenticated',
      exp: now + expiresInDays * 24 * 60 * 60,
    };

    const jwtToken = await this.jwtService.generateSupabaseJwt(jwtPayload);
    const tokenId = await this.betaAccessRepository.createToken({
      authToken,
      jwtToken,
      userId,
      expiresInDays,
    });

    return { authToken, tokenId };
  }
  async validateBetaAccessToken(
    authToken: string
  ): Promise<TokenValidationResult | null> {
    return await this.betaAccessRepository.validateToken(authToken);
  }

  /**
   * 베타 액세스 토큰으로 인증을 처리
   * 1. 토큰 검증
   * 2. JWT 토큰 반환 (Supabase 인증용)
   */
  async authenticateWithBetaToken(authToken: string): Promise<{
    success: boolean;
    jwtToken?: string;
    userId?: string;
    error?: string;
  }> {
    try {
      const validationResult = await this.validateBetaAccessToken(authToken);

      if (!validationResult || !validationResult.isValid) {
        return {
          success: false,
          error: 'Invalid or expired token',
        };
      }

      try {
        await this.jwtService.verifySupabaseJwt(validationResult.jwtToken);
      } catch (error) {
        return {
          success: false,
          error: 'Invalid JWT token',
        };
      }

      if (!validationResult.userId) {
        const userId = this.tokenGenerator.generateUuid();
        const used = await this.betaAccessRepository.useToken({
          authToken,
          userId,
        });

        if (!used) {
          return {
            success: false,
            error: 'Failed to use token',
          };
        }

        validationResult.userId = userId;
      }

      return {
        success: true,
        jwtToken: validationResult.jwtToken,
        userId: validationResult.userId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }
}
