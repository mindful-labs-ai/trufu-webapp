'use client';

import { create } from 'zustand';
import type { TokenResp } from '@/types/token';
import { getCredit, consumeCredit } from '@/services/token-client.service';

export interface TokenStatus {
  credit: number;
  updating: boolean;
  error?: string;
}
const initStatus: TokenStatus = { credit: 0, updating: false };

export interface WithTokenOpts<T> {
  finalizeAmount?: (result: T) => number;
}

export interface TokenStore {
  byType: Record<string, TokenStatus>;
  check(type: string): Promise<TokenResp>;
  consume(type: string, amount: number): Promise<TokenResp>;
  withToken<T>(
    type: string,
    planAmount: number,
    action: () => Promise<T>,
    opts?: WithTokenOpts<T>
  ): Promise<T>;
  statusOf(type: string): TokenStatus;
  reset(): void;
  _setStatus(type: string, patch: Partial<TokenStatus>): void;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  byType: {},

  check: async type => {
    get()._setStatus(type, { updating: true, error: undefined });
    try {
      const resp = await getCredit(type);
      get()._setStatus(type, { updating: false, credit: resp.credit });
      return resp;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'token_check_failed';
      get()._setStatus(type, { updating: false, error: msg });
      throw e;
    }
  },

  consume: async (type, amount) => {
    get()._setStatus(type, { updating: true, error: undefined });
    try {
      const resp = await consumeCredit(type, amount);
      get()._setStatus(type, { updating: false, credit: resp.credit });
      return resp;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'token_consume_failed';
      get()._setStatus(type, { updating: false, error: msg });
      throw e;
    }
  },

  withToken: (async <T>(
    type: string,
    planAmount: number,
    action: () => Promise<T>,
    opts?: WithTokenOpts<T>
  ): Promise<T> => {
    const pre = await get().check(type);
    if (!pre.ok || pre.credit <= 0) {
      const err = new Error('no_credit') as Error & { code?: string };
      err.code = 'no_credit';
      throw err;
    }
    const result = await action();
    const finalAmount = Math.max(
      0,
      Math.ceil(opts?.finalizeAmount ? opts.finalizeAmount(result) : planAmount)
    );
    await get().consume(type, finalAmount);
    return result;
  }) as TokenStore['withToken'],

  statusOf: type => get().byType[type] ?? initStatus,

  reset: () => set({ byType: {} }),

  _setStatus: (type, patch) =>
    set(s => ({
      byType: {
        ...s.byType,
        [type]: { ...(s.byType[type] ?? initStatus), ...patch },
      },
    })),
}));
