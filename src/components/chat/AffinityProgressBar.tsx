'use client';

import { AffinityService } from '@/services/affinity.service';
import { Affinity, AFFINITY_LEVELS, AffinityLevelInfo } from '@/types/affinity';

interface AffinityProgressBarProps {
  affinity: Affinity;
  // userId: string;
  // botId: string;
  // messageCount?: number; // AI 응답 시 증가하는 메시지 수
}

export function AffinityProgressBar({ affinity }: AffinityProgressBarProps) {
  const levelInfo = AFFINITY_LEVELS[affinity.affinity!]; // null check already done above
  const progress = AffinityService.calculateProgressToNextLevel(affinity);

  return (
    <>
      <div
        className={`flex items-center space-x-2 w-full rounded-lg p-2 transition-colors`}
      >
        <span className="text-lg">{levelInfo?.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">
            {levelInfo?.name}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-tertiary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress?.progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground min-w-0">
              {Math.round(progress?.progressPercent)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export function AffinityDetail({
  affinity,
  levelInfo,
  progress,
}: {
  affinity: Affinity;
  levelInfo: AffinityLevelInfo;
  progress: { progressPercent: number; isMaxLevel: boolean };
}) {
  const increaseRange = AffinityService.getAffinityIncreaseRange(
    affinity.affinity
  );
  return (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{levelInfo?.emoji}</span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {levelInfo.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {levelInfo.description}
            </p>
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
          <span className="text-muted-foreground">
            {progress.isMaxLevel ? '최고 레벨!' : `다음 레벨까지`}
          </span>
          <span className="font-medium">
            {Math.floor(progress.progressPercent)}%
            {!progress.isMaxLevel && ' / 100%'}
          </span>
        </div>

        <div className="bg-muted rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              progress.isMaxLevel
                ? 'bg-gradient-to-r from-secondary to-primary'
                : 'bg-tertiary'
            }`}
            style={{ width: `${Math.min(progress.progressPercent, 100)}%` }}
          />
        </div>

        {!progress.isMaxLevel && (
          <div className="text-xs text-muted-foreground mt-2">
            💬 대화할 때마다 {increaseRange.min}~{increaseRange.max}% 증가
          </div>
        )}
      </div>
    </>
  );
}
