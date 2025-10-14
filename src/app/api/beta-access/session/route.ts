import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseBetaAccessTokenRepository } from '@/infrastructure/repositories/supabase-beta-access-token.repository';
import { BetaAccessTokenService } from '@/domain/services/beta-access-token.service';
import { JwtService } from '@/infrastructure/services/jwt.service';
import { TokenGeneratorService } from '@/infrastructure/services/token-generator.service';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY!;

function createAdmin() {
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

function createService() {
  const admin = createAdmin();
  const repo = new SupabaseBetaAccessTokenRepository(admin);
  const jwt = new JwtService();
  const gen = new TokenGeneratorService();
  return new BetaAccessTokenService(repo, jwt, gen);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authToken: string = body?.authToken;
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Auth token is required' },
        { status: 400 }
      );
    }

    const admin = createAdmin();
    const service = createService();

    const validated = await service.validateBetaAccessToken(authToken);
    if (!validated || !validated.isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 유저 보장
    const userId = validated.userId ?? crypto.randomUUID();
    const email = `beta-${userId.slice(0, 8)}@trufu.beta`;

    await admin.auth.admin
      .createUser({
        id: userId,
        email,
        email_confirm: true,
        user_metadata: { beta_access: true, provider: 'beta-access' },
        app_metadata: { provider: 'beta-access', providers: ['beta-access'] },
      })
      .catch(() => {});

    // OTP(매직링크용 코드) 발급
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (error || !data?.properties?.email_otp) {
      return NextResponse.json(
        { success: false, error: 'Failed to issue OTP' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { email, email_otp: data.properties.email_otp as string },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
