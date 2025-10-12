'use client';

import { BetaAccessLogin } from '@/components/auth/BetaAccessLogin';
import { useBetaAccessStore } from '@/stores/betaAccessStore';
import { redirectAfterAuth } from '@/utils/auth-redirect';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BetaLoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useBetaAccessStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = (userData: {
    userId: string;
    jwtToken: string;
  }) => {
    console.log('베타 로그인 성공:', userData);
    setTimeout(() => {
      redirectAfterAuth(router);
    }, 1000);
  };

  const handleLoginError = (error: string) => {
    console.error('베타 로그인 실패:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Trufu</h1>
          <p className="mt-2 text-sm text-gray-600">로그인</p>
        </div>
        <div className="mt-8">
          <BetaAccessLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
        </div>
      </div>
    </div>
  );
}
