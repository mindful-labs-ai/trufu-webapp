'use client';

import { EmailPasswordLogin } from '@/components/auth/EmailPasswordLogin';
import { useUserStore } from '@/stores/userStore';
import { redirectAfterAuth } from '@/utils/auth-redirect';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EmailLoginPage() {
  const router = useRouter();
  const currentUser = useUserStore(s => s.me);

  useEffect(() => {
    if (currentUser) {
      redirectAfterAuth(router);
    }
  }, [currentUser, router]);

  const handleLoginSuccess = () => {
    redirectAfterAuth(router);
  };

  const handleLoginError = (error: string) => {
    console.error('이메일 로그인 실패:', error);
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
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Trufu</h1>
          <p className="mt-2 text-sm text-gray-600">이메일 로그인</p>
        </div>
        <div className="mt-8">
          <EmailPasswordLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
        </div>
      </div>
    </div>
  );
}
