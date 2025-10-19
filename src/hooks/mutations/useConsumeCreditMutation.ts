import { useMutation, useQueryClient } from '@tanstack/react-query';
import { consumeCredit } from '@/services/token-client.service';
import type { TokenResp } from '@/types/token';
import { QUERY_KEY } from '@/constants/queryKeys';

interface ConsumeParams {
  type: string;
  amount: number;
}

export function useConsumeCreditMutation() {
  const queryClient = useQueryClient();

  return useMutation<TokenResp, Error, ConsumeParams>({
    mutationFn: ({ type, amount }: ConsumeParams) =>
      consumeCredit(type, amount),

    onSuccess: (data, { type }) => {
      queryClient.setQueryData<TokenResp>(QUERY_KEY.CREDIT(type), old => ({
        ...old,
        ...data,
      }));
    },

    onError: (error, { type }) => {
      console.error(`Failed to consume credit for type ${type}:`, error);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEY.CREDIT(type),
      });
    },
  });
}
