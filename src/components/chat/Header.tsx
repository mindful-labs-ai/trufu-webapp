'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useFriendStore } from '@/stores/friendStore';
import { useUserStore } from '@/stores/userStore';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreditQuery } from '@/hooks/queries/useCreditQuery';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { selectedFriend } = useFriendStore();
  const me = useUserStore(s => s.me);
  const logout = useUserStore(s => s.logout);
  const isUserLoading = useUserStore(s => s.isLoading);
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: creditData, isLoading: isCreditLoading } = useCreditQuery({
    type: 'openai',
    enabled: !!me,
  });

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

  const handleProfileSettings = () => {
    router.push('/password-change');
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-card border-b border-border p-4 h-16 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
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
        <h1 className="ml-2 text-xl font-semibold text-foreground">
          {selectedFriend ? `${selectedFriend.name}` : 'Trufu'}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span className="text-primary-foreground text-sm font-medium">
              {me?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
              <div className="px-4 py-3 border-b border-border/50">
                <p className="text-sm font-medium text-foreground">
                  {me?.email || '사용자'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {me?.isAdmin ? '관리자' : '일반 사용자'}
                </p>
                {/* 크레딧 표시 */}
                <div className="mt-2 pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      크레딧
                    </span>
                    {isCreditLoading ? (
                      <span className="text-xs text-muted-foreground">
                        로딩 중...
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-foreground">
                        {creditData?.credit?.toLocaleString() ?? 0}
                      </span>
                    )}
                  </div>
                  {creditData && !creditData.allowed && (
                    <p className="text-xs text-red-500 mt-1">
                      크레딧이 부족합니다
                    </p>
                  )}
                </div>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted">
                프로필 설정
              </button>
              <button
                onClick={handleProfileSettings}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                비밀번호 변경
              </button>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                <span>다크 모드</span>
                <div
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-primary' : 'bg-muted-bg'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                      theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
                    } bg-primary-foreground`}
                  />
                </div>
              </button>
              <button
                onClick={handleLogout}
                disabled={isUserLoading}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
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
