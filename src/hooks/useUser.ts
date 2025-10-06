'use client';

import { DEFAULT_USER, User } from '@/types/user';
import { useEffect, useState } from 'react';

const USER_STORAGE_KEY = 'trufu_selected_user';

export const useUser = () => {
  const [user, setUser] = useState<User>(DEFAULT_USER);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error);
    }
  }, []);

  const changeUser = (user: User) => {
    setUser(user);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  };

  return {
    user,
    changeUser,
  };
};
