import { Chatbot, Friend } from '@/types/friend';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FriendState {
  selectedFriend: Chatbot | Friend | null;
  selectFriend: (friend: Friend) => void;
  clearSelectedFriend: () => void;
}

export const useFriendStore = create<FriendState>()(
  persist(
    set => ({
      selectedFriend: null,

      selectFriend: (friend: Friend) => {
        set({ selectedFriend: friend });
      },

      clearSelectedFriend: () => {
        set({ selectedFriend: null });
      },
    }),
    {
      name: 'trufu-friend-storage',
      partialize: state => ({
        selectedFriend: state.selectedFriend,
      }),
    }
  )
);
