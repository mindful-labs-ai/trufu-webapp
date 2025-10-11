import { create } from 'zustand';
import type { TokenResp } from '@/types/token.ts';
import { callTokenGuard } from '@/services/token-client.service';

export interface TokenStatus {
  usage: number;
  limit: number;
  remaining: number;
  updating: boolean;
  error?: string;
}

const initStatus: TokenStatus = {
  usage: 0,
  limit: 0,
  remaining: 0,
  updating: false,
};

export interface WithTokenOpts<T> {
  finalizeAmount: (result: T) => number;
}

export interface TokenStore {
  byType: Record<string, TokenStatus>;
  check(type: string, amount: number): Promise<TokenResp>;
  consume(type: string, amount: number): Promise<TokenResp>;
  withToken<T>(
    type: string,
    planAmount: number,
    action: () => Promise<T>,
    opts: WithTokenOpts<T>
  ): Promise<T>;

  statusOf(type: string): TokenStatus;

  reset(): void;

  /** @internal: 저수준 상태 패치(외부 직접 호출 지양) */
  _setStatus(type: string, patch: Partial<TokenStatus>): void;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  byType: {},

  check: async (type, amount) => {
    get()._setStatus(type, { updating: true, error: undefined });
    try {
      const resp = await callTokenGuard({ type, amount, mode: 'check' });
      get()._setStatus(type, {
        updating: false,
        usage: resp.usage,
        limit: resp.limit,
        remaining: resp.limit - resp.usage,
      });
      return resp;
    } catch (e: any) {
      get()._setStatus(type, {
        updating: false,
        error: e?.message || 'token_check_failed',
      });
      throw e;
    }
  },

  consume: async (type, amount) => {
    get()._setStatus(type, { updating: true, error: undefined });
    try {
      const resp = await callTokenGuard({ type, amount, mode: 'consume' });
      get()._setStatus(type, {
        updating: false,
        usage: resp.usage,
        limit: resp.limit,
        remaining: resp.limit - resp.usage,
      });
      return resp;
    } catch (e: any) {
      get()._setStatus(type, {
        updating: false,
        error: e?.message || 'token_consume_failed',
      });
      throw e;
    }
  },

  withToken: async <T>(
    type: string,
    planAmount: number,
    action: () => Promise<T>,
    opts: WithTokenOpts<T>
  ) => {
    const pre = await get().check(type, planAmount);
    if (!pre.ok || pre.allowed === false) {
      const err: any = new Error('token_exceeded');
      err.code = 'token_exceeded';
      throw err;
    }
    const result = await action();
    const finalAmount = Math.max(
      0,
      Math.ceil(opts?.finalizeAmount ? opts.finalizeAmount(result) : planAmount)
    );
    await get().consume(type, finalAmount);
    return result;
  },

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
