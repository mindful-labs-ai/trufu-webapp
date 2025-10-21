import {
  getSectionColors,
  parseMarkdownSections,
} from '../shared/markdown-parser';
import { AIPromptTabProps } from '../shared/types';
import { copyToClipboard } from '../shared/utils';

export const AIPromptTab = ({
  stats,
  showRawPrompt,
  onToggleRawPrompt,
}: AIPromptTabProps) => {
  const generatePromptNode = stats?.nodeExecutions?.find((node: any) =>
    ['generatePrompt', 'setEbookPrompt'].includes(node.nodeId)
  );

  if (!generatePromptNode?.subjectData?.promptData?.messages) {
    return <NoPromptDataMessage />;
  }

  const systemMessages = generatePromptNode.subjectData.promptData.messages
    .filter((m: any) => m.role === 'system')
    .map((m: any) => m.content)
    .join('\n\n');

  return (
    <div className="space-y-6">
      <AIPromptHeader
        showRawPrompt={showRawPrompt}
        onToggle={onToggleRawPrompt}
      />

      {showRawPrompt ? (
        <RawPromptView
          systemMessages={systemMessages}
          promptData={generatePromptNode.subjectData.promptData}
        />
      ) : (
        <FormattedPromptView systemMessages={systemMessages} />
      )}
    </div>
  );
};

const AIPromptHeader = ({
  showRawPrompt,
  onToggle,
}: {
  showRawPrompt: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-gray-900">🤖 AI 프롬프트 정보</h3>

    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-600">원본 모드 📝</span>
      <ToggleSwitch isOn={showRawPrompt} onToggle={onToggle} />
    </div>
  </div>
);

const ToggleSwitch = ({
  isOn,
  onToggle,
}: {
  isOn: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      isOn ? 'bg-blue-600' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
        isOn ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const RawPromptView = ({
  systemMessages,
  promptData,
}: {
  systemMessages: string;
  promptData: any;
}) => (
  <div className="space-y-4">
    <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-green-400">📄 원본 JSON 데이터</h4>
        {systemMessages && (
          <button
            onClick={() => copyToClipboard(systemMessages)}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
          >
            📋 복사
          </button>
        )}
      </div>
      <pre className="text-green-300 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
        {systemMessages || JSON.stringify(promptData, null, 2)}
      </pre>
    </div>
  </div>
);

const FormattedPromptView = ({
  systemMessages,
}: {
  systemMessages: string;
}) => {
  if (!systemMessages) {
    return <NoSystemMessagesMessage />;
  }

  const sections = parseMarkdownSections(systemMessages);

  if (sections.length === 0) {
    return <DefaultPromptView systemMessages={systemMessages} />;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const colors = getSectionColors(section.type);

        return (
          <div
            key={index}
            className={`border rounded-lg p-4 ${colors.bgColor}`}
          >
            {section.title && (
              <h4 className={`font-bold text-lg mb-3 ${colors.titleColor}`}>
                {section.title}
              </h4>
            )}
            <div
              className={`whitespace-pre-wrap text-sm leading-relaxed ${colors.contentColor}`}
            >
              {section.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const NoPromptDataMessage = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex">
      <div className="text-yellow-400">ℹ️</div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">
          프롬프트 데이터 없음
        </h3>
        <div className="mt-2 text-sm text-yellow-700">
          이 워크플로우에서 생성된 AI 프롬프트 정보가 없습니다.
        </div>
      </div>
    </div>
  </div>
);

const NoSystemMessagesMessage = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex">
      <div className="text-yellow-400">ℹ️</div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">
          시스템 프롬프트 없음
        </h3>
        <div className="mt-2 text-sm text-yellow-700">
          이 워크플로우에서 시스템 역할의 프롬프트가 발견되지 않았습니다.
        </div>
      </div>
    </div>
  </div>
);

const DefaultPromptView = ({ systemMessages }: { systemMessages: string }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="font-semibold text-gray-900 mb-3">전체 시스템 프롬프트</h4>
    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
      {systemMessages}
    </div>
  </div>
);
