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

export interface AffinitySubjectData {
  currentLevel: number;
  currentProgress: number;
  previousLevel?: number;
  previousProgress?: number;
  levelUp: boolean;
  progressIncrease: number;
  conversationId: number;
}

export interface SubjectDataSummary {
  chatHistory: ChatHistorySubjectData | null;
  memory: MemorySubjectData | null;
  prompt: PromptSubjectData | null;
  response: ResponseSubjectData | null;
  extractedMemory: ExtractedMemorySubjectData | null;
  affinity: AffinitySubjectData | null;
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
    affinity?: { currentLevel: number; currentProgress: number };
  };
}

export interface ChatWorkflowStatsRecord {
  id?: number;
  chat_id: string;
  stats: WorkflowAnalyticsData;
  created_at?: string;
}
