import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

export function useAuthStateSync() {
  const initialize = useUserStore(s => s.initialize);
  const clear = useUserStore(s => s.clear);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        initialize();
      } else if (event === 'SIGNED_OUT') {
        clear();
        showToast('로그아웃되었습니다', 'info');
        router.replace('/email-auth');
      } else if (event === 'TOKEN_REFRESHED') {
        initialize();
      } else if (event === 'USER_UPDATED') {
        initialize();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, clear, router, showToast]);
}
