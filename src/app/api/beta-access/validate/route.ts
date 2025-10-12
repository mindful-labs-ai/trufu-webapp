import { BetaAccessTokenService } from '@/domain/services/beta-access-token.service';
import { SupabaseBetaAccessTokenRepository } from '@/infrastructure/repositories/supabase-beta-access-token.repository';
import { JwtService } from '@/infrastructure/services/jwt.service';
import { TokenGeneratorService } from '@/infrastructure/services/token-generator.service';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// 서비스 인스턴스 생성
function createBetaAccessService() {
  const repository = new SupabaseBetaAccessTokenRepository(supabase);
  const jwtService = new JwtService();
  const tokenGenerator = new TokenGeneratorService();

  return new BetaAccessTokenService(repository, jwtService, tokenGenerator);
}

/**
 * POST /api/beta-access/validate
 * 베타 액세스 토큰 검증
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authToken } = body;

    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Auth token is required',
        },
        { status: 400 }
      );
    }

    const service = createBetaAccessService();
    const validationResult = await service.validateBetaAccessToken(authToken);

    if (!validationResult) {
      return NextResponse.json({
        success: false,
        isValid: false,
        error: 'Token not found',
      });
    }

    return NextResponse.json({
      success: true,
      isValid: validationResult.isValid,
      data: validationResult.isValid
        ? {
            tokenId: validationResult.tokenId,
            userId: validationResult.userId,
          }
        : null,
    });
  } catch (error) {
    console.error('Token validation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      },
      { status: 500 }
    );
  }
}
