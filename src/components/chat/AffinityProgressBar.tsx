'use client';

import { useAffinity } from '@/hooks/useAffinity';
import { AffinityService } from '@/services/affinity.service';
import { Affinity, AFFINITY_LEVELS, AffinityLevelInfo } from '@/types/affinity';
import { useState } from 'react';

interface AffinityProgressBarProps {
  userId: string;
  botId: string;
  messageCount?: number; // AI 응답 시 증가하는 메시지 수
}

export function AffinityProgressBar({
  userId,
  botId,
  messageCount = 0,
}: AffinityProgressBarProps) {
  const { affinity, isLoading } = useAffinity({ userId, botId, messageCount });
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return (
      <div className={`animate-pulse max-w-4xl mx-auto`}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!affinity) return null;

  const levelInfo = AFFINITY_LEVELS[affinity.affinity];
  const progress = AffinityService.calculateProgressToNextLevel(affinity);

  return (
    <>
      <div
        className={`flex items-center space-x-2 w-full cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors`}
        onClick={() => setShowModal(true)}
      >
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

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full mx-4 p-8"
            onClick={e => e.stopPropagation()}
          >
            <AffinityDetail
              affinity={affinity}
              levelInfo={levelInfo}
              progress={progress}
            />
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
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
            {Math.floor(progress.progressPercent)}%
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
    </>
  );
}
