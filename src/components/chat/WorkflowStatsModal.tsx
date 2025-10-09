'use client';

import {
  AIPromptTab,
  NodeDataTab,
  OpenAIUsageTab,
  SummaryTab,
  TAB_CONFIGS,
  TabType,
} from '@/components/stats';
import {
  calculateOpenAIUsageSummary,
  getOpenAIUsageByChat,
  OpenAIUsageSummary,
} from '@/services/openai-usage.service';
import { getWorkflowStats } from '@/services/workflow.service';
import { WorkflowAnalyticsData } from '@/types/workflow';
import { useEffect, useState } from 'react';

interface WorkflowStatsModalProps {
  onClose: () => void;
  messageId: string;
}

export const WorkflowStatsModal = ({
  onClose,
  messageId,
}: WorkflowStatsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('aiPrompt');
  const [stats, setStats] = useState<WorkflowAnalyticsData | null>(null);
  const [openaiUsage, setOpenaiUsage] = useState<OpenAIUsageSummary | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRawPrompt, setShowRawPrompt] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const [statsRecord, openaiUsageRecords] = await Promise.all([
          getWorkflowStats(messageId),
          getOpenAIUsageByChat(messageId),
        ]);

        if (statsRecord) {
          setStats(statsRecord.stats);
        } else {
          setLoading(false);
          setStats(null);
        }

        if (openaiUsageRecords.length > 0) {
          const openaiSummary = calculateOpenAIUsageSummary(openaiUsageRecords);
          setOpenaiUsage(openaiSummary);
        } else {
          setOpenaiUsage(null);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
        setError('통계를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    if (messageId) {
      loadStats();
    }
  }, [messageId]);

  const handleToggleRawPrompt = () => {
    setShowRawPrompt(prev => !prev);
  };

  const renderTabContent = () => {
    if (!stats) return null;

    const baseProps = { stats, openaiUsage };

    switch (activeTab) {
      case 'summary':
        return <SummaryTab {...baseProps} />;
      case 'nodeData':
        return <NodeDataTab {...baseProps} />;
      case 'openaiUsage':
        return <OpenAIUsageTab {...baseProps} />;
      case 'aiPrompt':
        return (
          <AIPromptTab
            {...baseProps}
            showRawPrompt={showRawPrompt}
            onToggleRawPrompt={handleToggleRawPrompt}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <ModalHeader onClose={onClose} />

        <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1 overflow-y-auto p-4">
            <ContentArea loading={loading} error={error} stats={stats}>
              {renderTabContent()}
            </ContentArea>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
    <h2 className="text-xl font-semibold">🔍 워크플로우 분석</h2>
    <button
      onClick={onClose}
      className="text-white hover:text-gray-200 text-2xl leading-none"
    >
      ×
    </button>
  </div>
);

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => (
  <div className="border-b border-gray-200 px-4 pt-4">
    <div className="flex space-x-8">
      {TAB_CONFIGS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === tab.key
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
);

interface ContentAreaProps {
  loading: boolean;
  error: string | null;
  stats: WorkflowAnalyticsData | null;
  children: React.ReactNode;
}

const ContentArea = ({ loading, error, stats, children }: ContentAreaProps) => {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!stats) {
    return <NoStatsState />;
  }

  return <div className="space-y-4">{children}</div>;
};

const LoadingState = () => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2">통계를 불러오는 중...</span>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex">
      <div className="text-red-400">⚠️</div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
        <div className="mt-2 text-sm text-red-700">{error}</div>
      </div>
    </div>
  </div>
);

const NoStatsState = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex">
      <div className="text-yellow-400">ℹ️</div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">통계 없음</h3>
        <div className="mt-2 text-sm text-yellow-700">
          이 메시지에 대한 워크플로우 실행 통계가 없습니다.
        </div>
      </div>
    </div>
  </div>
);
