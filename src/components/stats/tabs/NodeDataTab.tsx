import React, { useState } from 'react';
import { BaseTabProps } from '../shared/types';
import { NODE_NAME_KR, formatDuration } from '../shared/utils';

export const NodeDataTab = ({ stats }: BaseTabProps) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      노드별 생성 데이터
    </h3>
    <div className="space-y-4">
      {stats.nodeExecutions?.map((node: any) => (
        <NodeExecutionCard key={node.nodeId} node={node} />
      ))}
    </div>
  </div>
);

interface NodeExecutionCardProps {
  node: {
    nodeId: string;
    duration: number;
    subjectData?: any;
  };
}

const NodeExecutionCard = ({ node }: NodeExecutionCardProps) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <NodeHeader nodeId={node.nodeId} duration={node.duration} />
    <NodeContent nodeId={node.nodeId} subjectData={node.subjectData} />
  </div>
);

const NodeHeader = ({
  nodeId,
  duration,
}: {
  nodeId: string;
  duration: number;
}) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex space-y-1">
      <h4 className="font-semibold mr-2 text-gray-900">
        {NODE_NAME_KR[nodeId] || nodeId}
      </h4>
      <span className="text-sm text-gray-400">· {nodeId}</span>
    </div>
    <span className="text-sm text-gray-500">{formatDuration(duration)}</span>
  </div>
);

const NodeContent = ({
  nodeId,
  subjectData,
}: {
  nodeId: string;
  subjectData?: any;
}) => {
  if (!subjectData) {
    return <NoDataMessage />;
  }

  switch (nodeId) {
    case 'generatePrompt':
      return <GeneratePromptData subjectData={subjectData} />;
    case 'loadMemory':
      return <LoadMemoryData subjectData={subjectData} />;
    default:
      return <GenericNodeData subjectData={subjectData} />;
  }
};

const GeneratePromptData = ({ subjectData }: { subjectData: any }) => (
  <div className="space-y-2">
    {subjectData.promptData?.promptType && (
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">
          프롬프트 타입: {subjectData.promptData.promptType}
        </span>
        <div className="relative group">
          <span className="text-blue-500 cursor-help text-sm">ⓘ</span>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="bg-gray-900 text-white text-xs rounded py-3 px-4 shadow-lg min-w-max">
              <PromptTypeTooltip
                promptType={subjectData.promptData.promptType}
              />
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    )}
    {subjectData.promptData && (
      <GenericNodeData
        subjectData={
          typeof subjectData.promptData === 'string'
            ? subjectData.promptData
            : JSON.stringify(subjectData.promptData, null, 2)
        }
      />
    )}
  </div>
);

const PromptTypeTooltip = ({ promptType }: { promptType: string }) => {
  return (
    <div className="text-left">
      <div className="font-medium mb-1">프롬프트 타입:</div>
      <div className="space-y-1">
        <div className="text-xs">
          <span className="font-medium">empathy-response:</span> 감정적 지원,
          위로, 공감이 필요한 경우
        </div>
        <div className="text-xs">
          <span className="font-medium">understand-context:</span> 정보 제공,
          설명, 일반적인 질문 답변이 필요한 경우
        </div>
        <div className="text-xs">
          <span className="font-medium">give-advice:</span> 구체적인 조언, 추천,
          방법 제시가 필요한 경우
        </div>
      </div>
    </div>
  );
};

const LoadMemoryData = ({ subjectData }: { subjectData: any }) => (
  <div className="space-y-2">
    {subjectData.memoryData && (
      <div className="space-y-3">
        <MemorySection
          title="Semantic Memory"
          data={subjectData.memoryData.semantic}
          theme="blue"
          renderItem={(item, index) => (
            <>
              <div className="font-medium text-blue-900">{item.topic}</div>
              <div className="text-blue-700 mt-1">{item.context}</div>
              <div className="text-blue-600 text-xs mt-1">
                중요도: {item.importance}
              </div>
            </>
          )}
        />
        <MemorySection
          title="Event Memory"
          data={subjectData.memoryData.events}
          theme="green"
          renderItem={(item, index) => (
            <pre className="text-green-700 whitespace-pre-wrap">
              {JSON.stringify(item, null, 2)}
            </pre>
          )}
        />
        <MemorySection
          title="Social Memory"
          data={subjectData.memoryData.social}
          theme="purple"
          renderItem={(item, index) => (
            <pre className="text-purple-700 whitespace-pre-wrap">
              {JSON.stringify(item, null, 2)}
            </pre>
          )}
        />
        {(!subjectData.memoryData.semantic ||
          subjectData.memoryData.semantic.length === 0) &&
          (!subjectData.memoryData.events ||
            subjectData.memoryData.events.length === 0) &&
          (!subjectData.memoryData.social ||
            subjectData.memoryData.social.length === 0) && (
            <div className="text-sm text-gray-500 italic">
              메모리 데이터가 비어있습니다.
            </div>
          )}
      </div>
    )}
  </div>
);

interface MemorySectionProps {
  title: string;
  data: any[];
  theme: 'blue' | 'green' | 'purple';
  renderItem: (item: any, index: number) => React.ReactNode;
}

const MemorySection = ({
  title,
  data,
  theme,
  renderItem,
}: MemorySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data || data.length === 0) return null;

  const themeClasses = {
    blue: 'bg-blue-50 border-blue-300 text-blue-900',
    green: 'bg-green-50 border-green-300 text-green-900',
    purple: 'bg-purple-50 border-purple-300 text-purple-900',
  };

  const headerThemeClasses = {
    blue: 'hover:bg-blue-100 border-blue-200',
    green: 'hover:bg-green-100 border-green-200',
    purple: 'hover:bg-purple-100 border-purple-200',
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${headerThemeClasses[theme]}`}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {data.length}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded text-sm border-l-4 ${themeClasses[theme]}`}
              >
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const GenericNodeData = ({ subjectData }: { subjectData: any }) => (
  <div className="space-y-2">
    <div className="mt-1 p-2 bg-gray-900 rounded text-sm text-gray-900 max-h-32 overflow-y-auto">
      <pre className="text-green-300 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(subjectData, null, 2)}
      </pre>
    </div>
  </div>
);

const NoDataMessage = () => (
  <div className="text-sm text-gray-500 italic">
    이 노드에서 생성된 데이터가 없습니다.
  </div>
);
