'use client';

import { useFriendStore } from '@/stores/friendStore';
import { useUserStore } from '@/stores/userStore';
import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { selectedFriend } = useFriendStore();
  const me = useUserStore(s => s.me);
  const logout = useUserStore(s => s.logout);
  const isUserLoading = useUserStore(s => s.isLoading);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout', error);
    } finally {
      setIsProfileOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4 h-16 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="ml-2 text-xl font-semibold text-gray-800">
          {selectedFriend ? `${selectedFriend.name}` : 'Trufu'}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-white text-sm font-medium">
              {me?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {me?.email || '사용자'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {me?.isAdmin ? '관리자' : '일반 사용자'}
                </p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                프로필 설정
              </button>
              <button
                onClick={handleLogout}
                disabled={isUserLoading}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
