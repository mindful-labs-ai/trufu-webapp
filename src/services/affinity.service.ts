import { supabase } from '@/lib/supabase';
import { Affinity } from '@/types/affinity';

const PG_NO_ROWS_FOUND = 'PGRST116' as const;
export class AffinityService {
  static async createNewAffinity(
    userId: string,
    botId: string
  ): Promise<Affinity | null> {
    try {
      const { data: newData, error: insertError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          bot_id: botId,
          affinity: 1,
          affinity_progress: 0.0,
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
  static getAffinityIncreaseRange(level: number): { min: number; max: number } {
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
