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
  isInitialized: boolean;
  error?: string;

  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  clear: () => void;

  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      me: null,
      isLoading: false,
      isInitialized: false,
      error: undefined,

      initialize: async () => {
        if (get().isInitialized) {
          return;
        }

        set({ isLoading: true, error: undefined });
        try {
          const { data, error } = await supabase.auth.getUser();
          if (error || !data?.user) {
            set({
              me: null,
              isLoading: false,
              isInitialized: true,
              error: error?.message,
            });
            return;
          }
          const u = data.user;
          const isAdmin = Boolean(u.role === 'admin');

          set({
            me: { id: u.id, email: u.email ?? undefined, isAdmin, object: u },
            isLoading: false,
            isInitialized: true,
          });
        } catch (e: any) {
          set({
            me: null,
            isLoading: false,
            isInitialized: true,
            error: e?.message || 'init_failed',
          });
        }
      },

      refresh: async () => {
        await supabase.auth.refreshSession();
        await get().initialize();
      },

      logout: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            throw error;
          }
          set({
            me: null,
            isLoading: false,
            isInitialized: true,
          });
        } catch (e: any) {
          set({
            isLoading: false,
            error: e?.message || 'logout_failed',
          });
          throw e;
        }
      },

      clear: () =>
        set({
          me: null,
          isLoading: false,
          isInitialized: false,
          error: undefined,
        }),

      isAuthenticated: () => Boolean(get().me),
      isAdmin: () => Boolean(get().me?.isAdmin),
    }),
    {
      name: 'trufu-user',
      partialize: s => ({
        me: s.me,
      }),
    }
  )
);
