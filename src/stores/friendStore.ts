import { getAllFriends } from '@/services/friend.service';
import { Chatbot, Friend } from '@/types/friend';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FriendState {
  selectedFriend: Chatbot | Friend | null; // TODO: Chatbot으로 타입 변경
  availableFriends: Friend[]; // TODO: Chatbot으로 타입 변경
  isLoading: boolean;
  error: string | null;

  selectFriend: (friend: Friend) => void;
  clearSelectedFriend: () => void;
  loadFriends: () => Promise<void>;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateFriend: (friendId: string, updates: Partial<Friend>) => void;
  clearError: () => void;
}

export const useFriendStore = create<FriendState>()(
  persist(
    (set, get) => ({
      selectedFriend: null,
      availableFriends: [],
      isLoading: false,
      error: null,

      selectFriend: (friend: Friend) => {
        set({ selectedFriend: friend, error: null });
      },

      clearSelectedFriend: () => {
        set({ selectedFriend: null });
      },

      loadFriends: async () => {
        try {
          set({ isLoading: true, error: null });
          const friends = await getAllFriends();
          set({ availableFriends: friends });
        } catch (error) {
          console.error('Failed to load friends:', error);
          set({
            error:
              error instanceof Error ? error.message : 'Failed to load friends',
            availableFriends: [],
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
          selectedFriend?.id === friendId ? null : selectedFriend;

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
