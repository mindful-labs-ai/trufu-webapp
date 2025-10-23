import { supabase } from '@/lib/supabase';
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';

export interface RedeemResponse {
  ok: boolean;
  redeemed?: boolean;
  credit_added?: number;
  credit_after?: number;
  coupon?: {
    id: number;
    code: string;
    amount: number;
  };
  error?: string;
}

export async function redeemCoupon(
  code: string,
  type?: string
): Promise<RedeemResponse> {
  try {
    const { data } = await supabase.functions.invoke('redeem-coupon', {
      body: {
        code: code.trim().toUpperCase(),
        type,
      },
    });

    if (data && data.ok === false) {
      throw new Error(data.error || 'redeem_failed');
    }

    return data as RedeemResponse;
  } catch (e: any) {
    if (e instanceof FunctionsHttpError) {
      let payload: any = null;
      try {
        payload = await e.context.response.json();
      } catch {
        // no-op
      }
      const msg =
        payload?.error ||
        payload?.message ||
        e.message ||
        'Edge Function HTTP error';
      throw new Error(msg);
    }

    if (e instanceof FunctionsRelayError) {
      throw new Error(e.message || 'Edge Function Relay error');
    }

    if (e instanceof FunctionsFetchError) {
      throw new Error(e.message || 'Edge Function Fetch error');
    }

    throw new Error((e && e.message) || 'Unknown error');
  }
}
