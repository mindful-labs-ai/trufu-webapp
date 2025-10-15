'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface CurrentUser {
  id: string;
  email?: string;
  isAdmin: boolean;
  object: User;
}

interface UserStore {
  me: CurrentUser | null;
  isLoading: boolean;
  error?: string;

  /** 최초/재조회 */
  initialize: () => Promise<void>;
  /** 서버에서 claims 갱신 필요 시(예: 관리자 권한 토글 후) */
  refresh: () => Promise<void>;
  /** 메모리/스토리지 초기화 */
  clear: () => void;

  /** 파생 헬퍼 */
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      me: null,
      isLoading: false,
      error: undefined,

      initialize: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const { data, error } = await supabase.auth.getUser();
          if (error || !data?.user) {
            set({ me: null, isLoading: false, error: error?.message });
            return;
          }
          const u = data.user;
          const isAdmin = Boolean(u.role === 'admin');

          set({
            me: { id: u.id, email: u.email ?? undefined, isAdmin, object: u },
            isLoading: false,
          });
        } catch (e: any) {
          set({
            me: null,
            isLoading: false,
            error: e?.message || 'init_failed',
          });
        }
      },

      refresh: async () => {
        // 세션/클레임 갱신 → 다시 initialize
        await supabase.auth.refreshSession();
        await get().initialize();
      },

      clear: () => set({ me: null, isLoading: false, error: undefined }),

      isAuthenticated: () => Boolean(get().me),
      isAdmin: () => Boolean(get().me?.isAdmin),
    }),
    {
      name: 'trufu-user', // localStorage key
      partialize: s => ({
        me: s.me, // me만 저장해서 재방문시 바로 UI 가드 가능
      }),
    }
  )
);
