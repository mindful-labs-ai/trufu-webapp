import { BetaAccessTokenService } from '@/domain/services/beta-access-token.service';
import { SupabaseBetaAccessTokenRepository } from '@/infrastructure/repositories/supabase-beta-access-token.repository';
import { JwtService } from '@/infrastructure/services/jwt.service';
import { TokenGeneratorService } from '@/infrastructure/services/token-generator.service';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

function createBetaAccessService() {
  const repository = new SupabaseBetaAccessTokenRepository(supabase);
  const jwtService = new JwtService();
  const tokenGenerator = new TokenGeneratorService();

  return new BetaAccessTokenService(repository, jwtService, tokenGenerator);
}

/**
 * POST /api/beta-access/admin
 * 베타 액세스 토큰 생성 (관리자용)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expiresInDays = 30, userEmail } = body;

    // TODO: 관리자 권한 확인 로직 추가
    const service = createBetaAccessService();
    const result = await service.createBetaAccessToken(
      expiresInDays,
      userEmail
    );

    return NextResponse.json({
      success: true,
      data: {
        authToken: result.authToken,
        tokenId: result.tokenId,
        message: 'Beta access token created successfully',
      },
    });
  } catch (error) {
    console.error('Create beta access token failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Token creation failed',
      },
      { status: 500 }
    );
  }
}
