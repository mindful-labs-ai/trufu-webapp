import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/beta-access/debug-jwt
 * JWT 토큰 디버깅용 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jwtToken } = body;

    if (!jwtToken) {
      return NextResponse.json(
        { success: false, error: 'JWT token is required' },
        { status: 400 }
      );
    }

    // JWT 토큰 파싱
    const [header, payload, signature] = jwtToken.split('.');

    const decodedHeader = JSON.parse(atob(header));
    const decodedPayload = JSON.parse(atob(payload));

    // 현재 시간과 비교
    const now = Math.floor(Date.now() / 1000);
    const isExpired = decodedPayload.exp < now;

    // JWT 시크릿으로 검증
    let verificationResult = null;
    try {
      verificationResult = jwt.verify(
        jwtToken,
        process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET!,
        {
          algorithms: ['HS256'],
        }
      );
    } catch (verifyError) {
      verificationResult = {
        error:
          verifyError instanceof Error
            ? verifyError.message
            : 'Verification failed',
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        header: decodedHeader,
        payload: decodedPayload,
        currentTime: now,
        tokenExp: decodedPayload.exp,
        isExpired,
        timeUntilExpiry: decodedPayload.exp - now,
        verification: verificationResult,
      },
    });
  } catch (error) {
    console.error('JWT debug failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Debug failed',
      },
      { status: 500 }
    );
  }
}
