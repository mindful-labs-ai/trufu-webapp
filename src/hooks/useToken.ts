import { useTokenStore } from '@/stores/tokenStore';

export const useToken = (type: string) => {
  const status = useTokenStore(s => s.statusOf(type));
  const check = () => useTokenStore.getState().check(type);
  const consume = (amount: number) =>
    useTokenStore.getState().consume(type, amount);
  const withToken = <T>(
    planAmount: number,
    action: () => Promise<T>,
    opts?: { finalizeAmount?: (r: T) => number }
  ) => useTokenStore.getState().withToken(type, planAmount, action, opts);

  return { status, check, consume, withToken };
};
