import { create } from 'zustand';
import type { QuotaResp } from '@/types/quota';
import { callQuotaGuard } from '@/services/quota-client.service';

export interface QuotaStatus {
  usage: number;
  limit: number;
  remaining: number;
  updating: boolean;
  error?: string;
}

const initStatus: QuotaStatus = {
  usage: 0,
  limit: 0,
  remaining: 0,
  updating: false,
};

export interface WithQuotaOpts<T> {
  finalizeAmount: (result: T) => number;
}

export interface QuotaStore {
  byType: Record<string, QuotaStatus>;
  check(type: string, amount: number): Promise<QuotaResp>;
  consume(type: string, amount: number): Promise<QuotaResp>;
  withQuota<T>(
    type: string,
    planAmount: number,
    action: () => Promise<T>,
    opts: WithQuotaOpts<T>
  ): Promise<T>;

  statusOf(type: string): QuotaStatus;

  reset(): void;

  /** @internal: 저수준 상태 패치(외부 직접 호출 지양) */
  _setStatus(type: string, patch: Partial<QuotaStatus>): void;
}

export const useQuotaStore = create<QuotaStore>((set, get) => ({
  byType: {},

  check: async (type, amount) => {
    get()._setStatus(type, { updating: true, error: undefined });
    try {
      const resp = await callQuotaGuard({ type, amount, mode: 'check' });
      get()._setStatus(type, {
        updating: false,
        usage: resp.usage,
        limit: resp.limit,
        remaining: resp.remaining,
      });
      return resp;
    } catch (e: any) {
      get()._setStatus(type, {
        updating: false,
        error: e?.message || 'quota_check_failed',
      });
      throw e;
    }
  },

  consume: async (type, amount) => {
    get()._setStatus(type, { updating: true, error: undefined });
    try {
      const resp = await callQuotaGuard({ type, amount, mode: 'consume' });
      get()._setStatus(type, {
        updating: false,
        usage: resp.usage,
        limit: resp.limit,
        remaining: resp.remaining,
      });
      return resp;
    } catch (e: any) {
      get()._setStatus(type, {
        updating: false,
        error: e?.message || 'quota_consume_failed',
      });
      throw e;
    }
  },

  withQuota: async <T>(
    type: string,
    planAmount: number,
    action: () => Promise<T>,
    opts: WithQuotaOpts<T>
  ) => {
    const pre = await get().check(type, planAmount);
    if (!pre.ok || pre.allowed === false) {
      const err: any = new Error('quota_exceeded');
      err.code = 'quota_exceeded';
      throw err;
    }
    const result = await action();
    const finalAmount = Math.max(
      0,
      Math.floor(
        opts?.finalizeAmount ? opts.finalizeAmount(result) : planAmount
      )
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
