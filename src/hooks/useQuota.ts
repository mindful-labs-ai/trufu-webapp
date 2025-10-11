import { useQuotaStore } from '@/stores/quotaStore';

export const useQuota = (type: string) => {
  const status = useQuotaStore(s => s.statusOf(type));
  const check = (amount: number) =>
    useQuotaStore.getState().check(type, amount);
  const consume = (amount: number) =>
    useQuotaStore.getState().consume(type, amount);
  const withQuota = <T>(
    planAmount: number,
    action: () => Promise<T>,
    opts: { finalizeAmount: (r: T) => number }
  ) => useQuotaStore.getState().withQuota(type, planAmount, action, opts);

  return { status, check, consume, withQuota };
};
