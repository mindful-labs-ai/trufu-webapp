import { BaseTabProps } from '../shared/types';
import {
  NODE_NAME_KR,
  formatDuration,
  formatPercentage,
} from '../shared/utils';

export const OpenAIUsageTab = ({ openaiUsage }: BaseTabProps) => {
  if (!openaiUsage) {
    return <NoUsageDataMessage />;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        OpenAI API 사용량 통계
      </h3>
      <OverviewCards openaiUsage={openaiUsage} />
      <APIDetailsSection openaiUsage={openaiUsage} />
      <NodeUsageSection openaiUsage={openaiUsage} />
      <PerformanceSummary openaiUsage={openaiUsage} />
    </div>
  );
};

const OverviewCards = ({ openaiUsage }: { openaiUsage: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-green-50 rounded-lg p-4">
      <div className="text-green-600 text-2xl font-bold">
        {openaiUsage.total.totalRequests}
      </div>
      <div className="text-sm text-green-700">총 요청 수</div>
      <div className="text-xs text-green-600 mt-1">
        성공: {openaiUsage.total.successfulRequests}
      </div>
    </div>
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="text-blue-600 text-2xl font-bold">
        {openaiUsage.total.totalTokens.toLocaleString()}
      </div>
      <div className="text-sm text-blue-700">총 토큰 수</div>
    </div>
  </div>
);

const APIDetailsSection = ({ openaiUsage }: { openaiUsage: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <EmbeddingsAPICard openaiUsage={openaiUsage} />
    <ChatCompletionsAPICard openaiUsage={openaiUsage} />
  </div>
);

const EmbeddingsAPICard = ({ openaiUsage }: { openaiUsage: any }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="font-semibold text-gray-900 mb-3">🔗 Embeddings API</h4>
    <div className="space-y-2 text-sm">
      <StatRow label="요청 수" value={openaiUsage.embeddings.totalRequests} />
      <StatRow
        label="성공률"
        value={
          openaiUsage.embeddings.totalRequests > 0
            ? formatPercentage(
                openaiUsage.embeddings.successfulRequests /
                  openaiUsage.embeddings.totalRequests
              )
            : '0%'
        }
      />
      <StatRow
        label="총 토큰"
        value={openaiUsage.embeddings.totalTokens.toLocaleString()}
      />
      <StatRow
        label="평균 응답시간"
        value={formatDuration(openaiUsage.embeddings.averageDuration)}
      />
    </div>
  </div>
);

const ChatCompletionsAPICard = ({ openaiUsage }: { openaiUsage: any }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="font-semibold text-gray-900 mb-3">
      💬 Chat Completions API
    </h4>
    <div className="space-y-2 text-sm">
      <StatRow
        label="요청 수"
        value={openaiUsage.chatCompletions.totalRequests}
      />
      <StatRow
        label="성공률"
        value={
          openaiUsage.chatCompletions.totalRequests > 0
            ? formatPercentage(
                openaiUsage.chatCompletions.successfulRequests /
                  openaiUsage.chatCompletions.totalRequests
              )
            : '0%'
        }
      />
      <StatRow
        label="입력 토큰"
        value={openaiUsage.chatCompletions.requestTokens.toLocaleString()}
      />
      <StatRow
        label="출력 토큰"
        value={openaiUsage.chatCompletions.responseTokens.toLocaleString()}
      />
      <StatRow
        label="총 토큰"
        value={openaiUsage.chatCompletions.totalTokens.toLocaleString()}
      />
      <StatRow
        label="평균 응답시간"
        value={formatDuration(openaiUsage.chatCompletions.averageDuration)}
      />
    </div>
  </div>
);

const StatRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex justify-between">
    <span>{label}:</span>
    <span>{value}</span>
  </div>
);

const NodeUsageSection = ({ openaiUsage }: { openaiUsage: any }) => (
  <div className="space-y-4">
    <h4 className="font-semibold text-gray-900">🔧 노드별 OpenAI API 사용량</h4>
    <div className="grid grid-cols-3 gap-4">
      {openaiUsage.byNode?.map((nodeUsage: any) => (
        <NodeUsageCard key={nodeUsage.nodeId} nodeUsage={nodeUsage} />
      )) || <NoNodeUsageMessage />}
    </div>
  </div>
);

const NodeUsageCard = ({ nodeUsage }: { nodeUsage: any }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h5 className="font-medium text-gray-900 mb-3">
      {NODE_NAME_KR[nodeUsage.nodeId] || nodeUsage.nodeId}
    </h5>

    <div className="grid grid-cols-1 gap-4">
      {nodeUsage.embeddings.totalRequests > 0 && (
        <EmbeddingsUsage embeddings={nodeUsage.embeddings} />
      )}
      {nodeUsage.chatCompletions.totalRequests > 0 && (
        <ChatCompletionsUsage chatCompletions={nodeUsage.chatCompletions} />
      )}
    </div>

    <NodeUsageSummary nodeUsage={nodeUsage} />
  </div>
);

const EmbeddingsUsage = ({ embeddings }: { embeddings: any }) => (
  <div className="bg-blue-50 rounded p-3">
    <h6 className="font-medium text-blue-900 mb-2">🔗 Embeddings</h6>
    <div className="space-y-1 text-sm">
      <StatRow label="요청" value={embeddings.totalRequests} />
      <StatRow label="성공" value={embeddings.successfulRequests} />
      <StatRow label="토큰" value={embeddings.totalTokens.toLocaleString()} />
      <StatRow
        label="평균 시간"
        value={formatDuration(embeddings.averageDuration)}
      />
    </div>
  </div>
);

const ChatCompletionsUsage = ({
  chatCompletions,
}: {
  chatCompletions: any;
}) => (
  <div className="bg-green-50 rounded p-3">
    <h6 className="font-medium text-green-900 mb-2">💬 Chat Completions</h6>
    <div className="space-y-1 text-sm">
      <StatRow label="요청" value={chatCompletions.totalRequests} />
      <StatRow label="성공" value={chatCompletions.successfulRequests} />
      <StatRow
        label="입력 토큰"
        value={chatCompletions.requestTokens.toLocaleString()}
      />
      <StatRow
        label="출력 토큰"
        value={chatCompletions.responseTokens.toLocaleString()}
      />
      <StatRow
        label="평균 시간"
        value={formatDuration(chatCompletions.averageDuration)}
      />
    </div>
  </div>
);

const NodeUsageSummary = ({ nodeUsage }: { nodeUsage: any }) => (
  <div className="mt-3 pt-3 border-t border-gray-200">
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div className="text-center">
        <div className="font-medium text-gray-900">
          {nodeUsage.total.totalRequests}
        </div>
        <div className="text-gray-600">총 요청</div>
      </div>
      <div className="text-center">
        <div className="font-medium text-gray-900">
          {nodeUsage.total.totalTokens.toLocaleString()}
        </div>
        <div className="text-gray-600">총 토큰</div>
      </div>
    </div>
  </div>
);

const PerformanceSummary = ({ openaiUsage }: { openaiUsage: any }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h4 className="font-semibold text-gray-900 mb-3">⚡ 성능 요약</h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <PerformanceMetric
        label="총 API 시간"
        value={formatDuration(openaiUsage.total.totalDuration)}
      />
      <PerformanceMetric
        label="평균 응답시간"
        value={
          openaiUsage.total.totalRequests > 0
            ? formatDuration(
                openaiUsage.total.totalDuration /
                  openaiUsage.total.totalRequests
              )
            : '0ms'
        }
      />
      <PerformanceMetric
        label="전체 성공률"
        value={formatPercentage(
          openaiUsage.total.totalRequests > 0
            ? openaiUsage.total.successfulRequests /
                openaiUsage.total.totalRequests
            : 0
        )}
      />
      <PerformanceMetric
        label="평균 토큰/요청"
        value={
          openaiUsage.total.totalRequests > 0
            ? Math.round(
                openaiUsage.total.totalTokens / openaiUsage.total.totalRequests
              ).toLocaleString()
            : '0'
        }
      />
    </div>
  </div>
);

const PerformanceMetric = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="text-center">
    <div className="font-medium text-gray-900">{value}</div>
    <div className="text-gray-600">{label}</div>
  </div>
);

const NoNodeUsageMessage = () => (
  <div className="text-center text-gray-500 py-4">
    노드별 사용량 데이터가 없습니다.
  </div>
);

const NoUsageDataMessage = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex">
      <div className="text-yellow-400">ℹ️</div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">
          OpenAI 사용량 데이터 없음
        </h3>
        <div className="mt-2 text-sm text-yellow-700">
          이 워크플로우에 대한 OpenAI API 사용량 정보가 없습니다.
        </div>
      </div>
    </div>
  </div>
);
