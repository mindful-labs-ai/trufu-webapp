import { useQuery } from '@tanstack/react-query';
import { getCredit } from '@/services/token-client.service';
import type { TokenResp } from '@/types/token';
import { QUERY_KEY } from '@/constants/queryKeys';

interface UseCreditQueryParams {
  type: string;
  enabled?: boolean;
}

export function useCreditQuery({ type, enabled = true }: UseCreditQueryParams) {
  return useQuery<TokenResp, Error>({
    queryKey: QUERY_KEY.CREDIT(type),
    queryFn: () => getCredit(type),
    enabled: enabled && !!type,
    staleTime: 1000 * 30, // 30초 동안 fresh 상태 유지
    gcTime: 1000 * 60 * 5, // 5분 후 가비지 컬렉션
    refetchOnWindowFocus: true, // 창 포커스 시 재조회
    retry: 1,
  });
}
