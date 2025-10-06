'use client';

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

const NODE_NAME_KR: Record<string, string> = {
  loadChatHistory: '📚 채팅 히스토리 로드',
  loadMemory: '🧠 메모리 로드',
  generatePrompt: '✍️ 프롬프트 생성',
  generateResponse: '🤖 응답 생성',
  saveChatHistory: '💾 채팅 저장',
  extractMemory: '🔍 메모리 추출',
  saveMemory: '🧠 메모리 저장',
  generateEmbedding: '🔗 임베딩 생성',
  retrieveKnowledge: '📖 지식 검색',
};

type TabType = 'summary' | 'nodeData' | 'timeline' | 'openaiUsage' | 'aiPrompt';

export const WorkflowStatsModal = ({
  onClose,
  messageId,
}: WorkflowStatsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
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
        const statsRecord = await getWorkflowStats(messageId);
        if (statsRecord) {
          setStats(statsRecord.stats);
        } else {
          setStats(null);
        }

        const openaiUsageRecords = await getOpenAIUsageByChat(messageId);
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

    console.log('useEffect triggered:', { messageId });
    if (messageId) {
      loadStats();
    }
  }, [messageId]);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatPercentage = (rate: number): string => {
    return `${Math.round(rate * 100)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-[50] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">🔍 워크플로우 분석</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          <div className="border-b border-gray-200 px-4 pt-4">
            <div className="flex space-x-8">
              {[
                { key: 'summary' as const, label: '📊 요약', icon: '📊' },
                { key: 'timeline' as const, label: '⏱️ 타임라인', icon: '⏱️' },
                {
                  key: 'nodeData' as const,
                  label: '📝 노드 데이터',
                  icon: '📝',
                },
                {
                  key: 'openaiUsage' as const,
                  label: '☎️ OpenAI 요청',
                  icon: '☎️',
                },
                {
                  key: 'aiPrompt' as const,
                  label: '🤖 AI 프롬프트',
                  icon: '🤖',
                },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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

          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">통계를 불러오는 중...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-400">⚠️</div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      오류 발생
                    </h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && !stats && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-yellow-400">ℹ️</div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      통계 없음
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      이 메시지에 대한 워크플로우 실행 통계가 없습니다. <br />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stats && (
              <div className="space-y-4">
                {activeTab === 'summary' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-blue-600 text-2xl font-bold">
                          {formatDuration(stats.summary.totalDuration)}
                        </div>
                        <div className="text-sm text-blue-700">
                          총 실행 시간
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-green-600 text-2xl font-bold">
                          {formatPercentage(stats.summary.successRate)}
                        </div>
                        <div className="text-sm text-green-700">성공률</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-purple-600 text-2xl font-bold">
                          {stats.summary.totalNodes}
                        </div>
                        <div className="text-sm text-purple-700">
                          총 노드 수
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-orange-600 text-2xl font-bold">
                          {formatDuration(stats.summary.averageNodeDuration)}
                        </div>
                        <div className="text-sm text-orange-700">
                          평균 노드 시간
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        📋 처리된 데이터 요약
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {stats.subjectDataSummary.chatHistory && (
                          <div className="bg-white rounded p-3">
                            <span className="font-medium">
                              📚 채팅 히스토리:
                            </span>
                            <span className="ml-2">
                              {stats.subjectDataSummary.chatHistory
                                .messageCount || 0}
                              개 메시지
                            </span>
                          </div>
                        )}
                        {stats.subjectDataSummary.memory && (
                          <div className="bg-white rounded p-3">
                            <span className="font-medium">🧠 메모리:</span>
                            <span className="ml-2">
                              {stats.subjectDataSummary.memory.totalItems || 0}
                              개 항목
                            </span>
                          </div>
                        )}
                        {stats.subjectDataSummary.response && (
                          <div className="bg-white rounded p-3">
                            <span className="font-medium">💬 응답:</span>
                            <span className="ml-2">
                              {stats.subjectDataSummary.response
                                .responseLength || 0}
                              자
                            </span>
                          </div>
                        )}
                        {stats.subjectDataSummary.extractedMemory && (
                          <div className="bg-white rounded p-3">
                            <span className="font-medium">
                              🔍 추출된 메모리:
                            </span>
                            <span className="ml-2">
                              {stats.subjectDataSummary.extractedMemory
                                .extractedCount || 0}
                              개 항목
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'nodeData' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      노드별 생성 데이터
                    </h3>
                    <div className="space-y-4">
                      {stats.nodeExecutions?.map((node: any) => {
                        const subjectData = node.subjectData;
                        return (
                          <div
                            key={node.nodeId}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">
                                {NODE_NAME_KR[node.nodeId] || node.nodeId}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {formatDuration(node.duration)}
                              </span>
                            </div>

                            {/* generatePrompt 노드 데이터 */}
                            {node.nodeId === 'generatePrompt' &&
                              subjectData && (
                                <div className="space-y-2">
                                  {subjectData.promptType && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-700">
                                        Prompt Type:{' '}
                                      </span>
                                      <span className="text-sm text-gray-900">
                                        {subjectData.promptType}
                                      </span>
                                    </div>
                                  )}
                                  {subjectData.promptData && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-700">
                                        Prompt Data:{' '}
                                      </span>
                                      <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-900 max-h-32 overflow-y-auto">
                                        {typeof subjectData.promptData ===
                                        'string'
                                          ? subjectData.promptData
                                          : JSON.stringify(
                                              subjectData.promptData,
                                              null,
                                              2
                                            )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                            {/* loadMemory 노드 데이터 */}
                            {node.nodeId === 'loadMemory' && subjectData && (
                              <div className="space-y-2">
                                {subjectData.extractedMemory && (
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">
                                      Extracted Memory:{' '}
                                    </span>
                                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-900 max-h-32 overflow-y-auto">
                                      {typeof subjectData.extractedMemory ===
                                      'string'
                                        ? subjectData.extractedMemory
                                        : JSON.stringify(
                                            subjectData.extractedMemory,
                                            null,
                                            2
                                          )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 기타 노드들의 일반적인 subject 데이터 */}
                            {!['generatePrompt', 'loadMemory'].includes(
                              node.nodeId
                            ) &&
                              subjectData && (
                                <div className="space-y-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Node Data:{' '}
                                  </span>
                                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-900 max-h-32 overflow-y-auto">
                                    <pre>
                                      {JSON.stringify(subjectData, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                            {/* subject 데이터가 없는 경우 */}
                            {!subjectData && (
                              <div className="text-sm text-gray-500 italic">
                                이 노드에서 생성된 데이터가 없습니다.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 mb-4">
                      워크플로우 시작 시점을 기준으로 한 상대적 시간입니다.
                    </div>
                    {stats.timeline.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
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
                    ))}
                  </div>
                )}

                {/* OpenAI Usage Tab */}
                {activeTab === 'openaiUsage' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      OpenAI API 사용량 통계
                    </h3>

                    {openaiUsage ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-green-600 text-2xl font-bold">
                              {openaiUsage.total.totalRequests}
                            </div>
                            <div className="text-sm text-green-700">
                              총 요청 수
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              성공: {openaiUsage.total.successfulRequests}
                            </div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-blue-600 text-2xl font-bold">
                              {openaiUsage.total.totalTokens.toLocaleString()}
                            </div>
                            <div className="text-sm text-blue-700">
                              총 토큰 수
                            </div>
                          </div>
                        </div>

                        {/* API별 상세 통계 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Embeddings */}
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              🔗 Embeddings API
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>요청 수:</span>
                                <span>
                                  {openaiUsage.embeddings.totalRequests}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>성공률:</span>
                                <span>
                                  {openaiUsage.embeddings.totalRequests > 0
                                    ? formatPercentage(
                                        openaiUsage.embeddings
                                          .successfulRequests /
                                          openaiUsage.embeddings.totalRequests
                                      )
                                    : '0%'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>총 토큰:</span>
                                <span>
                                  {openaiUsage.embeddings.totalTokens.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>평균 응답시간:</span>
                                <span>
                                  {formatDuration(
                                    openaiUsage.embeddings.averageDuration
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Chat Completions */}
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              💬 Chat Completions API
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>요청 수:</span>
                                <span>
                                  {openaiUsage.chatCompletions.totalRequests}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>성공률:</span>
                                <span>
                                  {openaiUsage.chatCompletions.totalRequests > 0
                                    ? formatPercentage(
                                        openaiUsage.chatCompletions
                                          .successfulRequests /
                                          openaiUsage.chatCompletions
                                            .totalRequests
                                      )
                                    : '0%'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>입력 토큰:</span>
                                <span>
                                  {openaiUsage.chatCompletions.requestTokens.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>출력 토큰:</span>
                                <span>
                                  {openaiUsage.chatCompletions.responseTokens.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>총 토큰:</span>
                                <span>
                                  {openaiUsage.chatCompletions.totalTokens.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>평균 응답시간:</span>
                                <span>
                                  {formatDuration(
                                    openaiUsage.chatCompletions.averageDuration
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">
                            🔧 노드별 OpenAI API 사용량
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            {openaiUsage.byNode?.map(nodeUsage => (
                              <div
                                key={nodeUsage.nodeId}
                                className="bg-white border border-gray-200 rounded-lg p-4"
                              >
                                <h5 className="font-medium text-gray-900 mb-3">
                                  {NODE_NAME_KR[nodeUsage.nodeId] ||
                                    nodeUsage.nodeId}
                                </h5>

                                <div className="grid grid-cols-1 gap-4">
                                  {nodeUsage.embeddings.totalRequests > 0 && (
                                    <div className="bg-blue-50 rounded p-3">
                                      <h6 className="font-medium text-blue-900 mb-2">
                                        🔗 Embeddings
                                      </h6>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span>요청:</span>
                                          <span>
                                            {nodeUsage.embeddings.totalRequests}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>성공:</span>
                                          <span>
                                            {
                                              nodeUsage.embeddings
                                                .successfulRequests
                                            }
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>토큰:</span>
                                          <span>
                                            {nodeUsage.embeddings.totalTokens.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>평균 시간:</span>
                                          <span>
                                            {formatDuration(
                                              nodeUsage.embeddings
                                                .averageDuration
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 노드별 Chat Completions */}
                                  {nodeUsage.chatCompletions.totalRequests >
                                    0 && (
                                    <div className="bg-green-50 rounded p-3">
                                      <h6 className="font-medium text-green-900 mb-2">
                                        💬 Chat Completions
                                      </h6>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span>요청:</span>
                                          <span>
                                            {
                                              nodeUsage.chatCompletions
                                                .totalRequests
                                            }
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>성공:</span>
                                          <span>
                                            {
                                              nodeUsage.chatCompletions
                                                .successfulRequests
                                            }
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>입력 토큰:</span>
                                          <span>
                                            {nodeUsage.chatCompletions.requestTokens.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>출력 토큰:</span>
                                          <span>
                                            {nodeUsage.chatCompletions.responseTokens.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>평균 시간:</span>
                                          <span>
                                            {formatDuration(
                                              nodeUsage.chatCompletions
                                                .averageDuration
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* 노드별 요약 */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                      <div className="font-medium text-gray-900">
                                        {nodeUsage.total.totalRequests}
                                      </div>
                                      <div className="text-gray-600">
                                        총 요청
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-medium text-gray-900">
                                        {nodeUsage.total.totalTokens.toLocaleString()}
                                      </div>
                                      <div className="text-gray-600">
                                        총 토큰
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )) || (
                              <div className="text-center text-gray-500 py-4">
                                노드별 사용량 데이터가 없습니다.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 성능 정보 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            ⚡ 성능 요약
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium text-gray-900">
                                {formatDuration(
                                  openaiUsage.total.totalDuration
                                )}
                              </div>
                              <div className="text-gray-600">총 API 시간</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900">
                                {openaiUsage.total.totalRequests > 0
                                  ? formatDuration(
                                      openaiUsage.total.totalDuration /
                                        openaiUsage.total.totalRequests
                                    )
                                  : '0ms'}
                              </div>
                              <div className="text-gray-600">평균 응답시간</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900">
                                {formatPercentage(
                                  openaiUsage.total.totalRequests > 0
                                    ? openaiUsage.total.successfulRequests /
                                        openaiUsage.total.totalRequests
                                    : 0
                                )}
                              </div>
                              <div className="text-gray-600">전체 성공률</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900">
                                {openaiUsage.total.totalRequests > 0
                                  ? Math.round(
                                      openaiUsage.total.totalTokens /
                                        openaiUsage.total.totalRequests
                                    ).toLocaleString()
                                  : '0'}
                              </div>
                              <div className="text-gray-600">
                                평균 토큰/요청
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                          <div className="text-yellow-400">ℹ️</div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              OpenAI 사용량 데이터 없음
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              이 워크플로우에 대한 OpenAI API 사용량 정보가
                              없습니다.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AI 프롬프트 Tab */}
                {activeTab === 'aiPrompt' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        🤖 AI 프롬프트 정보
                      </h3>

                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">
                          원본 모드 📝
                        </span>
                        <button
                          onClick={() => setShowRawPrompt(!showRawPrompt)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            showRawPrompt ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                              showRawPrompt ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const generatePromptNode = stats?.nodeExecutions?.find(
                        (node: any) => node.nodeId === 'generatePrompt'
                      );

                      if (
                        !generatePromptNode?.subjectData?.promptData?.messages
                      ) {
                        return (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex">
                              <div className="text-yellow-400">ℹ️</div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                  프롬프트 데이터 없음
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                  이 워크플로우에서 생성된 AI 프롬프트 정보가
                                  없습니다.
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const systemMessages =
                        generatePromptNode.subjectData.promptData.messages
                          .filter((m: any) => m.role === 'system')
                          .map((m: any) => m.content)
                          .join('\n\n');

                      if (showRawPrompt) {
                        return (
                          <div className="space-y-4">
                            <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-green-400">
                                  📄 원본 JSON 데이터
                                </h4>
                                {systemMessages ? (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        systemMessages
                                      );
                                    }}
                                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                                  >
                                    📋 복사
                                  </button>
                                ) : null}
                              </div>
                              <pre className="text-green-300 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                {systemMessages
                                  ? systemMessages
                                  : JSON.stringify(
                                      generatePromptNode?.subjectData
                                        ?.promptData,
                                      null,
                                      2
                                    )}
                              </pre>
                            </div>
                          </div>
                        );
                      }

                      if (!systemMessages) {
                        return (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex">
                              <div className="text-yellow-400">ℹ️</div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                  시스템 프롬프트 없음
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                  이 워크플로우에서 시스템 역할의 프롬프트가
                                  발견되지 않았습니다.
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const parseMarkdownSections = (content: string) => {
                        const sections: {
                          title: string;
                          content: string;
                          type: string;
                        }[] = [];
                        const lines = content.split('\n');
                        let currentSection = {
                          title: '',
                          content: '',
                          type: 'default',
                        };

                        for (const line of lines) {
                          const trimmedLine = line.trim();

                          if (
                            trimmedLine.startsWith('**') &&
                            trimmedLine.endsWith('**') &&
                            trimmedLine.length > 4
                          ) {
                            if (
                              currentSection.title ||
                              currentSection.content
                            ) {
                              sections.push({ ...currentSection });
                            }

                            const title = trimmedLine.slice(2, -2);
                            let type = 'default';

                            if (
                              title.includes('Persona') ||
                              title.includes('페르소나')
                            )
                              type = 'persona';
                            else if (
                              title.includes('금지') ||
                              title.includes('피해야')
                            )
                              type = 'warning';
                            else if (
                              title.includes('핵심') ||
                              title.includes('역할')
                            )
                              type = 'primary';
                            else if (
                              title.includes('주의') ||
                              title.includes('가이드')
                            )
                              type = 'guide';
                            else if (
                              title.includes('감성지능') ||
                              title.includes('활용')
                            )
                              type = 'intelligence';

                            currentSection = { title, content: '', type };
                          } else if (trimmedLine) {
                            currentSection.content +=
                              (currentSection.content ? '\n' : '') + line;
                          }
                        }

                        if (currentSection.title || currentSection.content) {
                          sections.push(currentSection);
                        }

                        return sections;
                      };

                      const sections = parseMarkdownSections(systemMessages);

                      return (
                        <div className="space-y-4">
                          {sections.map((section, index) => {
                            const bgColor = {
                              persona: 'bg-blue-50 border-blue-200',
                              warning: 'bg-red-50 border-red-200',
                              primary: 'bg-green-50 border-green-200',
                              guide: 'bg-purple-50 border-purple-200',
                              intelligence: 'bg-orange-50 border-orange-200',
                              default: 'bg-gray-50 border-gray-200',
                            }[section.type];

                            const titleColor = {
                              persona: 'text-blue-800',
                              warning: 'text-red-800',
                              primary: 'text-green-800',
                              guide: 'text-purple-800',
                              intelligence: 'text-orange-800',
                              default: 'text-gray-800',
                            }[section.type];

                            const contentColor = {
                              persona: 'text-blue-700',
                              warning: 'text-red-700',
                              primary: 'text-green-700',
                              guide: 'text-purple-700',
                              intelligence: 'text-orange-700',
                              default: 'text-gray-700',
                            }[section.type];

                            return (
                              <div
                                key={index}
                                className={`border rounded-lg p-4 ${bgColor}`}
                              >
                                {section.title && (
                                  <h4
                                    className={`font-bold text-lg mb-3 ${titleColor}`}
                                  >
                                    {section.title}
                                  </h4>
                                )}
                                <div
                                  className={`whitespace-pre-wrap text-sm leading-relaxed ${contentColor}`}
                                >
                                  {section.content}
                                </div>
                              </div>
                            );
                          })}

                          {sections.length === 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-3">
                                전체 시스템 프롬프트
                              </h4>
                              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                                {systemMessages}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
