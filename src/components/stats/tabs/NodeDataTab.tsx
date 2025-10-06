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
    {subjectData.promptType && (
      <DataField label="Prompt Type" value={subjectData.promptType} />
    )}
    {subjectData.promptData && (
      <DataField
        label="PromptData"
        value={
          typeof subjectData.promptData === 'string'
            ? subjectData.promptData
            : JSON.stringify(subjectData.promptData, null, 2)
        }
        isScrollable
      />
    )}
  </div>
);

const LoadMemoryData = ({ subjectData }: { subjectData: any }) => (
  <div className="space-y-2">
    {subjectData.extractedMemory && (
      <DataField
        label="Extracted Memory"
        value={
          typeof subjectData.extractedMemory === 'string'
            ? subjectData.extractedMemory
            : JSON.stringify(subjectData.extractedMemory, null, 2)
        }
        isScrollable
      />
    )}
  </div>
);

const GenericNodeData = ({ subjectData }: { subjectData: any }) => (
  <div className="space-y-2">
    <span className="text-sm font-medium text-gray-700">Node Data: </span>
    <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-900 max-h-32 overflow-y-auto">
      <pre>{JSON.stringify(subjectData, null, 2)}</pre>
    </div>
  </div>
);

interface DataFieldProps {
  label: string;
  value: string;
  isScrollable?: boolean;
}

const DataField = ({ label, value, isScrollable = false }: DataFieldProps) => (
  <div>
    <span className="text-sm font-medium text-gray-700">{label}: </span>
    <div
      className={`mt-1 p-2 bg-gray-50 rounded text-sm text-gray-900 ${
        isScrollable ? 'max-h-32 overflow-y-auto' : ''
      }`}
    >
      {value}
    </div>
  </div>
);

const NoDataMessage = () => (
  <div className="text-sm text-gray-500 italic">
    이 노드에서 생성된 데이터가 없습니다.
  </div>
);
