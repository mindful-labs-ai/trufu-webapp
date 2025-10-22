import { useQuery } from '@tanstack/react-query';
import { getUnreadSummary } from '@/services/unread.service';
import { UnreadSummary } from '@/types/unread';

interface UseUnreadSummaryQueryParams {
  userId: string;
  enabled?: boolean;
}

export function useUnreadSummaryQuery({
  userId,
  enabled = true,
}: UseUnreadSummaryQueryParams) {
  return useQuery<UnreadSummary[], Error>({
    queryKey: ['UNREAD_SUMMARY', userId],
    queryFn: () => getUnreadSummary(),
    enabled: enabled && !!userId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
