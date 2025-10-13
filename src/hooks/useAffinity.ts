import { AffinityService } from '@/services/affinity.service';
import { Affinity } from '@/types/affinity';
import { useCallback, useEffect, useState } from 'react';

interface UseAffinityProps {
  userId: string;
  botId: string;
  messageCount?: number; // TODO: 메시지 수가 변경될 때마다 친밀도 새로고침 중인데,,, 더 좋은 방법 없나
}

export function useAffinity({
  userId,
  botId,
  messageCount = 0,
}: UseAffinityProps) {
  const [affinity, setAffinity] = useState<Affinity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAffinity = useCallback(async () => {
    if (!userId || !botId) return;

    try {
      const affinityData = await AffinityService.getAffinity(userId, botId);
      setAffinity(affinityData);
    } catch (error) {
      console.error('Failed to load affinity:', error);
    }
  }, [userId, botId]);

  useEffect(() => {
    if (!userId || !botId) return;

    const loadAffinity = async () => {
      setIsLoading(true);
      try {
        await refreshAffinity();
      } finally {
        setIsLoading(false);
      }
    };

    loadAffinity();
  }, [userId, botId, refreshAffinity]);

  useEffect(() => {
    if (messageCount > 0) {
      refreshAffinity();
    }
  }, [messageCount, refreshAffinity]);

  return {
    affinity,
    isLoading,
    refreshAffinity,
  };
}
