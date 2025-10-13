import { AffinitySubjectData } from '@/types/workflow';

interface AffinityItemProps {
  affinity: AffinitySubjectData;
  className?: string;
}

function getAffinityLevelName(level: number): string {
  switch (level) {
    case 1:
      return '새로운 친구';
    case 2:
      return '가까운 친구';
    case 3:
      return '절친';
    case 4:
      return '완전 찰떡궁합';
    default:
      return '알 수 없음';
  }
}

function getAffinityColor(level: number): string {
  switch (level) {
    case 1:
      return 'text-gray-600';
    case 2:
      return 'text-blue-600';
    case 3:
      return 'text-purple-600';
    case 4:
      return 'text-pink-600';
    default:
      return 'text-gray-500';
  }
}

function getProgressBarColor(level: number): string {
  switch (level) {
    case 1:
      return 'bg-gray-400';
    case 2:
      return 'bg-blue-400';
    case 3:
      return 'bg-purple-400';
    case 4:
      return 'bg-pink-400';
    default:
      return 'bg-gray-300';
  }
}

export function AffinityItem({ affinity, className = '' }: AffinityItemProps) {
  const levelName = getAffinityLevelName(affinity.currentLevel);
  const levelColor = getAffinityColor(affinity.currentLevel);
  const progressColor = getProgressBarColor(affinity.currentLevel);

  return (
    <div className={`p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">친밀도</span>
        {affinity.levelUp && (
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
            LEVEL UP! 🎉
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold ${levelColor}`}>
            Level {affinity.currentLevel}: {levelName}
          </span>
          <span className="text-xs text-gray-500">
            {affinity.currentProgress}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${affinity.currentProgress}%` }}
          />
        </div>

        {affinity.progressIncrease > 0 && (
          <div className="text-xs text-green-600">
            +{affinity.progressIncrease.toFixed(1)}% 증가 ↗️
          </div>
        )}

        {affinity.previousLevel !== undefined &&
          affinity.previousLevel !== affinity.currentLevel && (
            <div className="text-xs text-blue-600">
              Level {affinity.previousLevel} → Level {affinity.currentLevel}{' '}
              레벨업!
            </div>
          )}

        <div className="text-xs text-gray-500 mt-1">
          대화 ID: {affinity.conversationId}
        </div>
      </div>
    </div>
  );
}
