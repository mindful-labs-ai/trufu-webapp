import { LatestChatSummary } from '@/types/chat';

export function updateChatSummary(
  summaries: LatestChatSummary[],
  botId: string,
  message: LatestChatSummary['lastMessage']
): LatestChatSummary[] {
  const updated = [...summaries];
  const index = updated.findIndex(s => s.botId === botId);

  if (index >= 0) {
    updated[index] = { botId, lastMessage: message };
  } else {
    updated.push({ botId, lastMessage: message });
  }

  return updated;
}
