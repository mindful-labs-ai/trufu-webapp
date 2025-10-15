'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useBetaAccessStore } from '../../stores/betaAccessStore';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

export const BetaUserInfo: React.FC = () => {
  const { isAuthenticated, user, logout } = useBetaAccessStore();
  const clear = useUserStore(s => s.clear);
  const router = useRouter();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    const confirmed = confirm('로그아웃하시겠습니까?');
    if (confirmed) {
      await logout();
      await supabase.auth.signOut();
      clear();
      router.push('/beta-login');
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'B'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                ID: {user?.id?.slice(0, 8)}...
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
