import { useQuery } from '@tanstack/react-query';
import { AffinityService } from '@/services/affinity.service';
import { Affinity } from '@/types/affinity';
import { QUERY_KEY } from '@/constants/queryKeys';

interface UseAffinityQueryParams {
  userId: string;
  botId: string;
  enabled?: boolean;
}

export function useAffinityQuery({
  userId,
  botId,
  enabled = true,
}: UseAffinityQueryParams) {
  return useQuery<Affinity | null, Error>({
    queryKey: QUERY_KEY.AFFINITY({ userId, botId }),
    queryFn: () => AffinityService.getAffinity(userId, botId),
    enabled: enabled && !!userId && !!botId,
    staleTime: 1000 * 30, // 30초 동안 fresh 상태 유지
    gcTime: 1000 * 60 * 5, // 5분 후 가비지 컬렉션
    refetchOnWindowFocus: false, // affinity는 자주 변경되지 않으므로 false
    retry: 1,
  });
}
