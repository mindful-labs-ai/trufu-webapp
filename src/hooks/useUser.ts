'use client';

import { getAllUsers } from '@/services/user.service';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';

const USER_STORAGE_KEY = 'trufu_selected_user';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);

        const savedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Failed to parse saved user:', error);
          }
        }

        // 저장된 사용자가 없으면 DB에서 첫 번째 사용자 가져오기
        const users = await getAllUsers();
        if (users.length > 0) {
          setUser(users[0]);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const changeUser = (newUser: User) => {
    setUser(newUser);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  };

  return {
    user,
    isLoading,
    changeUser,
  };
};
