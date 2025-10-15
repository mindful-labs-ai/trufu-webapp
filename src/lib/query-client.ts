import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 fresh로 간주
      gcTime: 1000 * 60 * 10, // 10분 후 캐시에서 제거 (구 cacheTime)
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
      refetchOnReconnect: true, // 재연결 시 refetch
    },
    mutations: {
      retry: 0, // mutation은 재시도 안함
    },
  },
});
