'use client';

import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { useRouter } from 'next/navigation';

export default function PasswordChangePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
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
                d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zm0 0c-2.21 0-4 1.79-4 4v1a1 1 0 001 1h6a1 1 0 001-1v-1c0-2.21-1.79-4-4-4z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            보안 설정
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            비밀번호를 안전하게 변경하세요
          </p>
        </div>

        <ChangePasswordForm />

        <button
          onClick={handleBack}
          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
        >
          ← 메인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}
