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
 * POST /api/beta-access/login
 * 베타 액세스 토큰으로 로그인
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
    const result = await service.authenticateWithBetaToken(authToken);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        jwtToken: result.jwtToken,
        userId: result.userId,
        message: 'Authentication successful',
      },
    });
  } catch (error) {
    console.error('Beta access login failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 500 }
    );
  }
}
