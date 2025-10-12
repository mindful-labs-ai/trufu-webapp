import { supabase } from '@/lib/supabase';
import type { TokenResp } from '@/types/token';

const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/token-guard`;

export const getCredit = async (type: string): Promise<TokenResp> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${base}?type=${encodeURIComponent(type)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'token_get_failed');
  return json as TokenResp;
};

export const consumeCredit = async (
  type: string,
  amount: number
): Promise<TokenResp> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(base, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, amount }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'token_consume_failed');
  return json as TokenResp;
};
