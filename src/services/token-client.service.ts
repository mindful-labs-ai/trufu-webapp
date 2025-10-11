import type { TokenBody, TokenResp } from '@/types/token';
import { supabase } from '@/lib/supabase';

const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/token-token-guard`;

export const callTokenGuard = async (body: TokenBody): Promise<TokenResp> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(base, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = (await response.json()) as TokenResp | { error: string };
  if (!response.ok)
    throw new Error((json as any).error || 'token_guard_failed');
  return json as TokenResp;
};
