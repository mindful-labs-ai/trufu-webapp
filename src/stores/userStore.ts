import { getAllUsers } from '@/services/user.service';
import { User } from '@/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  isLoadingUsers: boolean;
  error: string | null;

  setCurrentUser: (user: User) => void;
  loadUsers: () => Promise<void>;
  initializeUser: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      isLoading: true,
      isLoadingUsers: false,
      error: null,

      setCurrentUser: (user: User) => {
        set({ currentUser: user });
      },

      loadUsers: async () => {
        try {
          set({ isLoadingUsers: true, error: null });
          const userData = await getAllUsers();
          set({ users: userData });
        } catch (error) {
          console.error('Failed to load users:', error);
          set({
            error:
              error instanceof Error ? error.message : 'Failed to load users',
            users: [],
          });
        } finally {
          set({ isLoadingUsers: false });
        }
      },

      initializeUser: async () => {
        try {
          set({ isLoading: true, error: null });
          const { currentUser } = get();

          if (currentUser) {
            await get().loadUsers();
            set({ isLoading: false });
            return;
          }

          await get().loadUsers();

          // FIXME: 임시로 첫 번째 유저를 currentUser로 설정
          const { users } = get();
          if (users.length > 0) {
            set({ currentUser: users[0] });
          }
        } catch (error) {
          console.error('Failed to initialize user:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to initialize user',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // 에러 클리어
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'trufu-user-storage', // localStorage 키
      partialize: state => ({
        currentUser: state.currentUser, // currentUser만 영구 저장
      }),
    }
  )
);
