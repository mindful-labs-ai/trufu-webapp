'use client';

import { useBetaAccessStore } from '@/stores/betaAccessStore';
import { isPublicPath, redirectToBetaLogin } from '@/utils/auth-redirect';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean; // 인증 필수 여부 (기본값: true)
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  requireAuth = true,
}) => {
  const { isAuthenticated, checkAuthStatus, refreshSession, isSessionValid } =
    useBetaAccessStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuthStatus();
      setIsLoading(false);
    };

    initializeAuth();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(
      async () => {
        try {
          const isValid = await isSessionValid();
          if (!isValid) {
            const refreshResult = await refreshSession();
            if (!refreshResult.success) {
              console.error('Session refresh failed:', refreshResult.error);
            }
          }
        } catch (error) {
          console.error('Session validation error:', error);
        }
      },
      5 * 60 * 1000
    ); // 5분마다 확인

    return () => clearInterval(intervalId);
  }, [isAuthenticated, isSessionValid, refreshSession]);

  useEffect(() => {
    console.log('Auth state check:', {
      isLoading,
      requireAuth,
      isAuthenticated,
      pathname,
    });

    if (
      !isLoading &&
      requireAuth &&
      !isAuthenticated &&
      !isPublicPath(pathname)
    ) {
      redirectToBetaLogin(router, pathname);
    }
  }, [isLoading, requireAuth, isAuthenticated, pathname, router]);

  if (!requireAuth || isPublicPath(pathname)) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">인증 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
