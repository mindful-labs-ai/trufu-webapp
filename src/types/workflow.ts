export interface WorkflowSummaryData {
  totalDuration: number | undefined;
  totalNodes: number;
  successfulNodes: number;
  failedNodes: number;
  successRate: number;
  averageNodeDuration: number | undefined;
  longestNode: string | undefined;
  shortestNode: string | undefined;
}

export interface NodeExecutionData {
  nodeId: string;
  duration: number | undefined;
  status: string;
  error?: string;
  inputSize?: number;
  outputSize?: number;
  subjectData?: unknown;
  metadata?: Record<string, unknown>;
}

export interface SlowNodeData {
  nodeId: string;
  duration: number;
  threshold: number;
  overagePercentage: number;
}

export interface FailedNodeData {
  nodeId: string;
  status: string;
  error?: string;
  duration?: number | undefined;
}

export interface PerformanceData {
  slowNodes: SlowNodeData[];
  failedNodes: FailedNodeData[];
  recommendations: string[];
}

export interface ChatHistorySubjectData {
  messageCount: number | undefined;
  hasMessages: boolean;
  lastMessagePreview?: string;
}

export interface MemorySubjectData {
  totalItems: number | undefined;
  breakdown: {
    social: number;
    events: number;
    semantic: number;
  };
}

export interface PromptSubjectData {
  promptType: string | undefined;
  messageCount: number | undefined;
  hasContext: boolean;
  contextPreview?: string;
}

export interface ResponseSubjectData {
  responseLength: number | undefined;
  responsePreview?: string;
  hasResponse: boolean;
}

export interface ExtractedMemorySubjectData {
  extractedCount: number | undefined;
  breakdown: {
    social: number;
    events: number;
    semantic: number;
  };
  sampleData: {
    social?: string | null;
    events?: string | null;
    semantic?: string | null;
  };
}

export interface SubjectDataSummary {
  chatHistory: ChatHistorySubjectData | null;
  memory: MemorySubjectData | null;
  prompt: PromptSubjectData | null;
  response: ResponseSubjectData | null;
  extractedMemory: ExtractedMemorySubjectData | null;
}

export interface TimelineData {
  nodeId: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: string;
}

export interface WorkflowAnalyticsData {
  workflowId: string;
  summary: {
    totalDuration: number;
    successRate: number;
    totalNodes: number;
    averageNodeDuration: number;
  };
  nodeExecutions: Array<{
    nodeId: string;
    duration: number;
    status: string;
    subjectData?: { [key: string]: any };
  }>;
  timeline: Array<{
    nodeId: string;
    startTime: number;
    endTime: number;
    duration: number;
  }>;
  subjectDataSummary: {
    chatHistory?: { messageCount: number };
    memory?: { totalItems: number };
    response?: { responseLength: number };
    extractedMemory?: { extractedCount: number };
  };
}
// export interface WorkflowAnalyticsData {
//   workflowId: string;
//   summary: WorkflowSummaryData;
//   nodeExecutions: NodeExecutionData[];
//   performance: PerformanceData;
//   subjectDataSummary: SubjectDataSummary;
//   timeline: TimelineData[];
//   generatedAt: string;
// }

// 데이터베이스 저장 구조
export interface ChatWorkflowStatsRecord {
  id?: number;
  chat_id: string;
  stats: WorkflowAnalyticsData;
  created_at?: string;
}

// 노드 타입 정의
export type NodeType =
  | 'loadChatHistory'
  | 'loadMemory'
  | 'generatePrompt'
  | 'generateResponse'
  | 'extractMemory';
export type NodeStatus = 'completed' | 'failed' | 'pending';

// 한국어 노드명 매핑
export const NODE_NAME_KR: Record<NodeType, string> = {
  loadChatHistory: '채팅 히스토리 로드',
  loadMemory: '메모리 로드',
  generatePrompt: '프롬프트 생성',
  generateResponse: '응답 생성',
  extractMemory: '메모리 추출',
};

// 상태 아이콘 매핑
export const STATUS_ICON: Record<NodeStatus, string> = {
  completed: '✅',
  failed: '❌',
  pending: '⏳',
};
