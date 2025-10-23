import { supabase } from '@/lib/supabase';
import { Affinity } from '@/types/affinity';

const PG_NO_ROWS_FOUND = 'PGRST116' as const;
export class AffinityService {
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

      if (selectError && selectError.code !== PG_NO_ROWS_FOUND) {
        console.error('Failed to get affinity:', selectError);
        return null;
      }

      if (
        existingData?.affinity === null ||
        existingData?.affinity_progress === null
      ) {
        const { data: updated, error: updateError } = await supabase
          .from('conversations')
          .update({
            affinity: 1,
            affinity_progress: 0.0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id)
          .select('*')
          .single();

        if (updateError) throw updateError;

        return updated;
      }

      return existingData;
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
