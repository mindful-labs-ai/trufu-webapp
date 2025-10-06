'use client';

import { useSelectedFriend } from '@/hooks/useSelectedFriend';
import { getAllUsers } from '@/services/user.service';
import { User } from '@/types/user';
import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  user: User;
  onUserChange?: (user: User) => void;
}

export const Header = ({ onMenuClick, user, onUserChange }: HeaderProps) => {
  const { selectedFriend } = useSelectedFriend();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 사용자 목록 로드
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const userData = await getAllUsers();
        setUsers(userData);
      } catch (error) {
        console.error('Failed to load users:', error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserSelect = (user: User) => {
    onUserChange?.(user);
    setIsDropdownOpen(false);
  };
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
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
          {selectedFriend ? `${selectedFriend.title}와 대화중` : 'Trufu Chat'}
        </h1>
        <div className="ml-4 px-3 py-1 bg-blue-50 rounded-full">
          <span className="text-sm text-blue-700 font-medium">
            현재 사용자: {user.nickname}
          </span>
        </div>
        {selectedFriend && (
          <div className="ml-2 px-3 py-1 bg-green-50 rounded-full">
            <span className="text-sm text-green-700 font-medium">
              🤖 Bot: {selectedFriend.botId}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* User Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-lg">{user.avatar}</span>
            <span className="text-sm font-medium text-gray-700">
              {user.nickname}
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                사용자 선택
              </div>
              {isLoadingUsers ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  사용자 로딩 중...
                </div>
              ) : users.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  사용자가 없습니다
                </div>
              ) : (
                users.map((userOption: User) => (
                  <button
                    key={userOption.id}
                    onClick={() => handleUserSelect(userOption)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                      userOption.id === user.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{userOption.avatar}</span>
                    <div>
                      <div className="font-medium">{userOption.nickname}</div>
                      <div className="text-xs text-gray-500">
                        {userOption.email}
                      </div>
                    </div>
                    {userOption.id === user.id && (
                      <div className="ml-auto">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* AI Avatar */}
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">AI</span>
        </div>
      </div>
    </header>
  );
};
