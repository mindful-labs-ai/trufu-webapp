'use client';

import type { Friend } from '@/types/friend';
import { DEFAULT_FRIENDS, getDefaultFriend } from '@/types/friend';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'selected-friend';

export function useSelectedFriend() {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedFriendId = localStorage.getItem(STORAGE_KEY);

      let savedFriend = DEFAULT_FRIENDS.find(f => f.id === savedFriendId);
      if (!savedFriendId || !savedFriend) {
        savedFriend = getDefaultFriend();
        localStorage.setItem(STORAGE_KEY, savedFriend.id);
      }
      setSelectedFriend(savedFriend);
    } catch (error) {
      console.error('Error loading selected friend:', error);
      setSelectedFriend(getDefaultFriend());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    try {
      localStorage.setItem(STORAGE_KEY, friend.id);
    } catch (error) {
      console.error('Error saving selected friend:', error);
    }
  };

  // friend 선택 해제 (테스트용)
  const clearSelectedFriend = () => {
    setSelectedFriend(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing selected friend:', error);
    }
  };

  return {
    selectedFriend,
    selectFriend,
    clearSelectedFriend,
    isLoading,
    availableFriends: DEFAULT_FRIENDS,
  };
}
