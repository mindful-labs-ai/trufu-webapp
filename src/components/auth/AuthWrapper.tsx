'use client';

import { useUserStore } from '@/stores/userStore';
import {
  isPublicPath,
  redirectToLogin,
  getRedirectPath,
} from '@/utils/auth-redirect';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuthStateSync } from '@/hooks/useAuthStateSync';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  requireAuth = true,
}) => {
  const initialize = useUserStore(s => s.initialize);
  const me = useUserStore(s => s.me);
  const isLoading = useUserStore(s => s.isLoading);
  const isInitialized = useUserStore(s => s.isInitialized);
  const router = useRouter();
  const pathname = usePathname();

  useAuthStateSync();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const isAuthPage = pathname === '/email-auth';

    if (isAuthPage && me) {
      const redirectPath = getRedirectPath();
      router.replace(redirectPath);
      return;
    }

    if (!requireAuth || isPublicPath(pathname)) {
      return;
    }

    if (!me) {
      redirectToLogin(router, pathname);
    }
  }, [isInitialized, isLoading, requireAuth, pathname, router, me]);

  if (!requireAuth || isPublicPath(pathname)) {
    return <>{children}</>;
  }

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            인증 상태를 확인하는 중...
          </p>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            로그인 페이지로 이동 중...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
