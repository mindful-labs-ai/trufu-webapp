import type { QuotaBody, QuotaResp } from '@/types/quota';
import { supabase } from '@/lib/supabase';

const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/token-quota-guard`;

export const callQuotaGuard = async (body: QuotaBody): Promise<QuotaResp> => {
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

  const json = (await response.json()) as QuotaResp | { error: string };
  if (!response.ok)
    throw new Error((json as any).error || 'quota_guard_failed');
  return json as QuotaResp;
};
