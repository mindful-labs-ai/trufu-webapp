import { supabase } from '@/lib/supabase';

export interface OpenAIUsageRecord {
  id: number;
  chat_id?: string;
  workflow_id?: string;
  request_id: string;
  endpoint: 'embeddings' | 'chat/completions';
  model: string;
  request_tokens?: number;
  response_tokens?: number;
  total_tokens?: number;
  success: boolean;
  error_message?: string;
  request_duration: number;
  created_at: string;
}

export interface OpenAIUsageByNode {
  nodeId: string;
  embeddings: {
    totalRequests: number;
    successfulRequests: number;
    totalTokens: number;
    averageDuration: number;
  };
  chatCompletions: {
    totalRequests: number;
    successfulRequests: number;
    totalTokens: number;
    requestTokens: number;
    responseTokens: number;
    averageDuration: number;
  };
  total: {
    totalRequests: number;
    successfulRequests: number;
    totalTokens: number;
    totalDuration: number;
  };
}

export interface OpenAIUsageSummary {
  embeddings: {
    totalRequests: number;
    successfulRequests: number;
    totalTokens: number;
    averageDuration: number;
  };
  chatCompletions: {
    totalRequests: number;
    successfulRequests: number;
    totalTokens: number;
    requestTokens: number;
    responseTokens: number;
    averageDuration: number;
  };
  total: {
    totalRequests: number;
    successfulRequests: number;
    totalTokens: number;
    totalDuration: number;
  };
  byNode: OpenAIUsageByNode[];
}

export async function getOpenAIUsageByChat(
  chatId: string
): Promise<OpenAIUsageRecord[]> {
  try {
    const { data, error } = await supabase
      .from('openai_usage_stats')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch OpenAI usage records:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching OpenAI usage records:', error);
    return [];
  }
}

export function calculateOpenAIUsageSummary(
  records: OpenAIUsageRecord[]
): OpenAIUsageSummary {
  const embeddingsRecords = records.filter(r => r.endpoint === 'embeddings');
  const chatRecords = records.filter(r => r.endpoint === 'chat/completions');

  const embeddingsSummary = {
    totalRequests: embeddingsRecords.length,
    successfulRequests: embeddingsRecords.filter(r => r.success).length,
    totalTokens: embeddingsRecords.reduce(
      (sum, r) => sum + (r.total_tokens || 0),
      0
    ),
    averageDuration:
      embeddingsRecords.length > 0
        ? embeddingsRecords.reduce((sum, r) => sum + r.request_duration, 0) /
          embeddingsRecords.length
        : 0,
  };

  const chatSummary = {
    totalRequests: chatRecords.length,
    successfulRequests: chatRecords.filter(r => r.success).length,
    totalTokens: chatRecords.reduce((sum, r) => sum + (r.total_tokens || 0), 0),
    requestTokens: chatRecords.reduce(
      (sum, r) => sum + (r.request_tokens || 0),
      0
    ),
    responseTokens: chatRecords.reduce(
      (sum, r) => sum + (r.response_tokens || 0),
      0
    ),
    averageDuration:
      chatRecords.length > 0
        ? chatRecords.reduce((sum, r) => sum + r.request_duration, 0) /
          chatRecords.length
        : 0,
  };

  const totalTokens = embeddingsSummary.totalTokens + chatSummary.totalTokens;

  // 노드별 통계 계산
  const byNode = calculateUsageByNode(records);

  return {
    embeddings: embeddingsSummary,
    chatCompletions: chatSummary,
    total: {
      totalRequests: records.length,
      successfulRequests: records.filter(r => r.success).length,
      totalTokens,
      totalDuration: records.reduce((sum, r) => sum + r.request_duration, 0),
    },
    byNode,
  };
}

/**
 * 노드별 OpenAI 사용량 통계 계산
 */
function calculateUsageByNode(
  records: OpenAIUsageRecord[]
): OpenAIUsageByNode[] {
  // request_id에서 노드 이름 추출 (format: {nodeId}_{timestamp})
  const nodeGroups = new Map<string, OpenAIUsageRecord[]>();

  records.forEach(record => {
    const nodeId = record.request_id.split('_')[0];
    if (!nodeGroups.has(nodeId)) {
      nodeGroups.set(nodeId, []);
    }
    nodeGroups.get(nodeId)!.push(record);
  });

  const result: OpenAIUsageByNode[] = [];

  for (const [nodeId, nodeRecords] of nodeGroups.entries()) {
    const embeddingsRecords = nodeRecords.filter(
      r => r.endpoint === 'embeddings'
    );
    const chatRecords = nodeRecords.filter(
      r => r.endpoint === 'chat/completions'
    );

    const embeddingsSummary = {
      totalRequests: embeddingsRecords.length,
      successfulRequests: embeddingsRecords.filter(r => r.success).length,
      totalTokens: embeddingsRecords.reduce(
        (sum, r) => sum + (r.total_tokens || 0),
        0
      ),
      averageDuration:
        embeddingsRecords.length > 0
          ? embeddingsRecords.reduce((sum, r) => sum + r.request_duration, 0) /
            embeddingsRecords.length
          : 0,
    };

    const chatSummary = {
      totalRequests: chatRecords.length,
      successfulRequests: chatRecords.filter(r => r.success).length,
      totalTokens: chatRecords.reduce(
        (sum, r) => sum + (r.total_tokens || 0),
        0
      ),
      requestTokens: chatRecords.reduce(
        (sum, r) => sum + (r.request_tokens || 0),
        0
      ),
      responseTokens: chatRecords.reduce(
        (sum, r) => sum + (r.response_tokens || 0),
        0
      ),
      averageDuration:
        chatRecords.length > 0
          ? chatRecords.reduce((sum, r) => sum + r.request_duration, 0) /
            chatRecords.length
          : 0,
    };

    const totalTokens = embeddingsSummary.totalTokens + chatSummary.totalTokens;

    result.push({
      nodeId,
      embeddings: embeddingsSummary,
      chatCompletions: chatSummary,
      total: {
        totalRequests: nodeRecords.length,
        successfulRequests: nodeRecords.filter(r => r.success).length,
        totalTokens,
        totalDuration: nodeRecords.reduce(
          (sum, r) => sum + r.request_duration,
          0
        ),
      },
    });
  }

  return result.sort((a, b) => a.nodeId.localeCompare(b.nodeId));
}

/**
 * 일별 사용량 트렌드 조회
 */
export async function getOpenAIUsageTrend(
  fromDate: string,
  toDate: string,
  chatId?: string
): Promise<
  Array<{
    date: string;
    totalRequests: number;
    totalTokens: number;
  }>
> {
  try {
    let query = supabase
      .from('openai_usage_stats')
      .select('*')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);

    if (chatId) {
      query = query.eq('chat_id', chatId);
    }

    const { data, error } = await query.order('created_at', {
      ascending: true,
    });

    if (error) {
      console.error('Failed to fetch daily usage trend:', error);
      return [];
    }

    const dailyStats = new Map<string, OpenAIUsageRecord[]>();

    (data || []).forEach((record: OpenAIUsageRecord) => {
      const date = record.created_at.split('T')[0]; // YYYY-MM-DD 형식
      if (!dailyStats.has(date)) {
        dailyStats.set(date, []);
      }
      dailyStats.get(date)!.push(record);
    });

    // 일별 통계 계산
    const trends: Array<{
      date: string;
      totalRequests: number;
      totalTokens: number;
    }> = [];

    for (const [date, records] of dailyStats.entries()) {
      const summary = calculateOpenAIUsageSummary(records);
      trends.push({
        date,
        totalRequests: summary.total.totalRequests,
        totalTokens: summary.total.totalTokens,
      });
    }

    return trends.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error calculating daily usage trend:', error);
    return [];
  }
}
