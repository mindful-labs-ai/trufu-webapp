'use client';

import { AffinityService } from '@/services/affinity.service';
import { Affinity, AFFINITY_LEVELS } from '@/types/affinity';
import { useEffect, useState } from 'react';

interface AffinityProgressBarProps {
  userId: string;
  botId: string;
  className?: string;
}

export function AffinityProgressBar({
  userId,
  botId,
  className = '',
}: AffinityProgressBarProps) {
  const [affinity, setAffinity] = useState<Affinity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !botId) return;

    const loadAffinity = async () => {
      setIsLoading(true);
      try {
        const affinityData = await AffinityService.getAffinity(userId, botId);
        setAffinity(affinityData);
      } catch (error) {
        console.error('Failed to load affinity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAffinity();
  }, [userId, botId]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!affinity) return null;

  const levelInfo = AFFINITY_LEVELS[affinity.affinity];
  const progress = AffinityService.calculateProgressToNextLevel(affinity);
  const increaseRange = AffinityService.getAffinityIncreaseRange(
    affinity.affinity
  );

  return (
    <div className={`flex items-center space-x-2 w-full ${className}`}>
      <span className="text-lg">{levelInfo.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">
          친밀도 {affinity.affinity}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 min-w-0">
            {Math.round(progress.progressPercent)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function AffinityModal({
  userId,
  botId,
  className = '',
}: AffinityProgressBarProps) {
  const [affinity, setAffinity] = useState<Affinity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !botId) return;

    const loadAffinity = async () => {
      setIsLoading(true);
      try {
        const affinityData = await AffinityService.getAffinity(userId, botId);
        setAffinity(affinityData);
      } catch (error) {
        console.error('Failed to load affinity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAffinity();
  }, [userId, botId]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!affinity) return null;

  const levelInfo = AFFINITY_LEVELS[affinity.affinity];
  const progress = AffinityService.calculateProgressToNextLevel(affinity);
  const increaseRange = AffinityService.getAffinityIncreaseRange(
    affinity.affinity
  );

  return (
    <div
      className={`bg-white rounded-lg p-4 border border-gray-200 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{levelInfo.emoji}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {levelInfo.name}
            </h3>
            <p className="text-sm text-gray-600">{levelInfo.description}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${levelInfo.color}`}
        >
          Level {affinity.affinity}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {progress.isMaxLevel ? '최고 레벨!' : `다음 레벨까지`}
          </span>
          <span className="font-medium">
            {Math.round(progress.progressPercent)}%
            {!progress.isMaxLevel && ' / 100%'}
          </span>
        </div>

        <div className="bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              progress.isMaxLevel
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(progress.progressPercent, 100)}%` }}
          />
        </div>

        {!progress.isMaxLevel && (
          <div className="text-xs text-gray-500 mt-2">
            💬 대화할 때마다 {increaseRange.min}~{increaseRange.max}% 증가
          </div>
        )}
      </div>
    </div>
  );
}
