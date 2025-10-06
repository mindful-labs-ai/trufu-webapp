import { OpenAIUsageSummary } from '@/services/openai-usage.service';
import { WorkflowAnalyticsData } from '@/types/workflow';

export type TabType =
  | 'summary'
  | 'nodeData'
  | 'openaiUsage'
  | 'aiPrompt';

export interface BaseTabProps {
  stats: WorkflowAnalyticsData;
  openaiUsage?: OpenAIUsageSummary | null;
}

export interface AIPromptTabProps extends BaseTabProps {
  showRawPrompt: boolean;
  onToggleRawPrompt: () => void;
}

export interface TabConfig {
  key: TabType;
  label: string;
  icon: string;
}

export interface MarkdownSection {
  title: string;
  content: string;
  type: SectionType;
}

export type SectionType =
  | 'persona'
  | 'warning'
  | 'primary'
  | 'guide'
  | 'intelligence'
  | 'default';

export interface SectionColors {
  bgColor: string;
  titleColor: string;
  contentColor: string;
}
