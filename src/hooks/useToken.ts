import { useTokenStore } from '@/stores/tokenStore';

export const useToken = (type: string) => {
  const status = useTokenStore(s => s.statusOf(type));
  const check = (amount: number) =>
    useTokenStore.getState().check(type, amount);
  const consume = (amount: number) =>
    useTokenStore.getState().consume(type, amount);
  const withtoken = <T>(
    planAmount: number,
    action: () => Promise<T>,
    opts: { finalizeAmount: (r: T) => number }
  ) => useTokenStore.getState().withToken(type, planAmount, action, opts);

  return { status, check, consume, withtoken };
};
