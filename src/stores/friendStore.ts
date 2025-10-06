import { DEFAULT_FRIENDS, Friend, getDefaultFriend } from '@/types/friend';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FriendState {
  selectedFriend: Friend | null;
  availableFriends: Friend[];
  isLoading: boolean;
  error: string | null;

  selectFriend: (friend: Friend) => void;
  clearSelectedFriend: () => void;
  initializeFriend: () => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateFriend: (friendId: string, updates: Partial<Friend>) => void;
  clearError: () => void;
}

export const useFriendStore = create<FriendState>()(
  persist(
    (set, get) => ({
      selectedFriend: null,
      availableFriends: DEFAULT_FRIENDS,
      isLoading: true,
      error: null,

      selectFriend: (friend: Friend) => {
        set({ selectedFriend: friend, error: null });
      },

      clearSelectedFriend: () => {
        set({ selectedFriend: null });
      },

      initializeFriend: () => {
        try {
          set({ isLoading: true, error: null });

          const { selectedFriend } = get();

          if (selectedFriend) {
            const isValidFriend = DEFAULT_FRIENDS.find(
              f => f.id === selectedFriend.id
            );
            if (isValidFriend) {
              set({ isLoading: false });
              return;
            }
          }

          const defaultFriend = getDefaultFriend();
          set({ selectedFriend: defaultFriend });
        } catch (error) {
          console.error('Failed to initialize friend:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to initialize friend',
            selectedFriend: getDefaultFriend(),
          });
        } finally {
          set({ isLoading: false });
        }
      },

      addFriend: (friend: Friend) => {
        const { availableFriends } = get();
        const exists = availableFriends.find(f => f.id === friend.id);

        if (!exists) {
          set({ availableFriends: [...availableFriends, friend] });
        }
      },

      removeFriend: (friendId: string) => {
        const { availableFriends, selectedFriend } = get();
        const updatedFriends = availableFriends.filter(f => f.id !== friendId);

        const newSelectedFriend =
          selectedFriend?.id === friendId ? getDefaultFriend() : selectedFriend;

        set({
          availableFriends: updatedFriends,
          selectedFriend: newSelectedFriend,
        });
      },

      updateFriend: (friendId: string, updates: Partial<Friend>) => {
        const { availableFriends, selectedFriend } = get();

        const updatedFriends = availableFriends.map(friend =>
          friend.id === friendId ? { ...friend, ...updates } : friend
        );

        const updatedSelectedFriend =
          selectedFriend?.id === friendId
            ? { ...selectedFriend, ...updates }
            : selectedFriend;

        set({
          availableFriends: updatedFriends,
          selectedFriend: updatedSelectedFriend,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'trufu-friend-storage', // localStorage 키
      partialize: state => ({
        selectedFriend: state.selectedFriend,
      }),
    }
  )
);
