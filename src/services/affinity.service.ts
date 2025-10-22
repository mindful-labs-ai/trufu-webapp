import { supabase } from '@/lib/supabase';
import { Affinity } from '@/types/affinity';

const PG_NO_ROWS_FOUND = 'PGRST116' as const;
export class AffinityService {
  static async createNewAffinity(
    userId: string,
    botId: string
  ): Promise<Affinity | null> {
    try {
      const { data: chatbotData, error: chatbotError } = await supabase
        .from('chatbots')
        .select('has_affinity')
        .eq('id', botId)
        .single();

      if (chatbotError) {
        console.error('Failed to fetch chatbot data:', chatbotError);
        return null;
      }

      const affinityValue = chatbotData.has_affinity ? 1 : null;
      const affinityProgress = chatbotData.has_affinity ? 0.0 : null;

      const { data: newData, error: insertError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          bot_id: botId,
          affinity: affinityValue,
          affinity_progress: affinityProgress,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create affinity record:', insertError);
        return null;
      }

      return newData;
    } catch (error) {
      console.error('Error creating affinity record:', error);
      return null;
    }
  }

  static async getAffinity(
    userId: string,
    botId: string
  ): Promise<Affinity | null> {
    try {
      const { data: existingData, error: selectError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('bot_id', botId)
        .single();

      if (existingData) {
        return existingData;
      }

      if (selectError && selectError.code !== PG_NO_ROWS_FOUND) {
        console.error('Failed to get affinity:', selectError);
        return null;
      }

      // Create new affinity record based on chatbot's has_affinity setting
      return await this.createNewAffinity(userId, botId);
    } catch (error) {
      console.error('Error getting affinity:', error);
      return null;
    }
  }

  /**
   * 다음 레벨까지의 진행률 계산
   */
  static calculateProgressToNextLevel(affinity: Affinity): {
    currentLevel: number;
    nextLevel: number | null;
    progressPercent: number;
    isMaxLevel: boolean;
  } {
    // Handle null affinity values
    if (affinity.affinity === null || affinity.affinity_progress === null) {
      return {
        currentLevel: 0,
        nextLevel: null,
        progressPercent: 0,
        isMaxLevel: false,
      };
    }

    const currentLevel = affinity.affinity;
    const currentProgress = affinity.affinity_progress;
    const isMaxLevel = currentLevel >= 4;

    return {
      currentLevel,
      nextLevel: isMaxLevel ? null : currentLevel + 1,
      progressPercent: currentProgress,
      isMaxLevel,
    };
  }

  /**
   * 친밀도 레벨 별 예상 증가율 범위 반환
   */
  static getAffinityIncreaseRange(level: number | null): {
    min: number;
    max: number;
  } {
    if (level === null) {
      return { min: 0, max: 0 };
    }

    switch (level) {
      case 1:
        return { min: 15, max: 20 };
      case 2:
        return { min: 6, max: 10 };
      case 3:
        return { min: 4, max: 7 };
      case 4:
        return { min: 1, max: 3 };
      default:
        return { min: 1, max: 3 };
    }
  }
}
