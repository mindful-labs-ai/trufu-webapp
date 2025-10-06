import { BaseTabProps } from '../shared/types';
import {
  NODE_NAME_KR,
  formatDuration,
  formatPercentage,
} from '../shared/utils';

export const SummaryTab = ({ stats }: BaseTabProps) => (
  <div className="space-y-4">
    <SummaryCards stats={stats} />
    <ProcessedDataSummary stats={stats} />
    <Timeline stats={stats} />
  </div>
);

const SummaryCards = ({ stats }: BaseTabProps) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <SummaryCard
      value={formatDuration(stats.summary.totalDuration)}
      label="총 실행 시간"
      bgColor="bg-blue-50"
      textColor="text-blue-600"
      labelColor="text-blue-700"
    />
    <SummaryCard
      value={formatPercentage(stats.summary.successRate)}
      label="성공률"
      bgColor="bg-green-50"
      textColor="text-green-600"
      labelColor="text-green-700"
    />
    <SummaryCard
      value={stats.summary.totalNodes.toString()}
      label="총 노드 수"
      bgColor="bg-purple-50"
      textColor="text-purple-600"
      labelColor="text-purple-700"
    />
    <SummaryCard
      value={formatDuration(stats.summary.averageNodeDuration)}
      label="평균 노드 시간"
      bgColor="bg-orange-50"
      textColor="text-orange-600"
      labelColor="text-orange-700"
    />
  </div>
);

interface SummaryCardProps {
  value: string;
  label: string;
  bgColor: string;
  textColor: string;
  labelColor: string;
}

const SummaryCard = ({
  value,
  label,
  bgColor,
  textColor,
  labelColor,
}: SummaryCardProps) => (
  <div className={`${bgColor} rounded-lg p-4`}>
    <div className={`${textColor} text-2xl font-bold`}>{value}</div>
    <div className={`text-sm ${labelColor}`}>{label}</div>
  </div>
);

const ProcessedDataSummary = ({ stats }: BaseTabProps) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="font-medium text-gray-900 mb-3">📋 처리된 데이터 요약</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      {stats.subjectDataSummary.chatHistory && (
        <DataSummaryItem
          icon="📚"
          label="채팅 히스토리"
          value={`${stats.subjectDataSummary.chatHistory.messageCount || 0}개 메시지`}
        />
      )}
      {stats.subjectDataSummary.memory && (
        <DataSummaryItem
          icon="🧠"
          label="메모리"
          value={`${stats.subjectDataSummary.memory.totalItems || 0}개 항목`}
        />
      )}
      {stats.subjectDataSummary.response && (
        <DataSummaryItem
          icon="💬"
          label="응답"
          value={`${stats.subjectDataSummary.response.responseLength || 0}자`}
        />
      )}
      {stats.subjectDataSummary.extractedMemory && (
        <DataSummaryItem
          icon="🔍"
          label="추출된 메모리"
          value={`${stats.subjectDataSummary.extractedMemory.extractedCount || 0}개 항목`}
        />
      )}
    </div>
  </div>
);

interface DataSummaryItemProps {
  icon: string;
  label: string;
  value: string;
}

const DataSummaryItem = ({ icon, label, value }: DataSummaryItemProps) => (
  <div className="bg-white rounded p-3">
    <span className="font-medium">
      {icon} {label}:
    </span>
    <span className="ml-2">{value}</span>
  </div>
);

const Timeline = ({ stats }: BaseTabProps) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="font-medium text-gray-900 mb-3">⏱️ 타임라인</h3>
    <div className="space-y-3">
      <TimelineDescription />
      {stats.timeline.map((item, index) => (
        <TimelineItem key={index} item={item} />
      ))}
    </div>
  </div>
);

const TimelineDescription = () => (
  <div className="text-sm text-gray-600 mb-4">
    워크플로우 시작 시점을 기준으로 한 상대적 시간입니다.
  </div>
);

interface TimelineItemProps {
  item: {
    nodeId: string;
    duration: number;
    startTime: number;
    endTime: number;
  };
}

const TimelineItem = ({ item }: TimelineItemProps) => (
  <div className="flex items-center space-x-4">
    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
    <div className="flex-1 border-l-2 border-gray-200 pl-4 pb-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {NODE_NAME_KR[item.nodeId] || item.nodeId}
        </span>
        <span className="text-sm text-gray-600">
          {formatDuration(item.duration)}
        </span>
      </div>
      <div className="text-sm text-gray-500">
        {item.startTime}ms ~ {item.endTime}ms
      </div>
    </div>
  </div>
);
