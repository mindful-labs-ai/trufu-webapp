export const NODE_NAME_KR: Record<string, string> = {
  loadChatHistory: '📚 채팅 히스토리 로드',
  generateEmbedding: '🔗 임베딩 생성',
  loadMemory: '🧠 메모리 로드',
  generatePrompt: '✍️ 프롬프트 생성',
  generateResponse: '🤖 응답 생성',
  saveChatHistory: '💾 채팅 저장',
  extractMemory: '🔍 메모리 추출',
  saveMemory: '🧠 메모리 저장',
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

export const formatPercentage = (rate: number): string => {
  return `${Math.round(rate * 100)}%`;
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
};
