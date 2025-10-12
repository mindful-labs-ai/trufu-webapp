'use client';

import { useBetaAccessStore } from '@/stores/betaAccessStore';
import React, { useState } from 'react';

interface BetaAccessLoginProps {
  onSuccess?: (userData: { userId: string; jwtToken: string }) => void;
  onError?: (error: string) => void;
}

export const BetaAccessLogin: React.FC<BetaAccessLoginProps> = ({
  onSuccess,
  onError,
}) => {
  const [authToken, setAuthToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useBetaAccessStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authToken.trim()) {
      setError('인증 토큰을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login with token:', authToken.trim());

      const result = await login(authToken.trim());

      if (!result.success) {
        throw new Error(result.error || '인증에 실패했습니다.');
      }

      onSuccess?.({
        userId: authToken.trim(),
        jwtToken: 'jwt-token-set-via-store',
      });

      setError(null);
      setAuthToken('');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      console.error('Login failed:', errorMessage);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-gray-700">
            베타 액세스
          </h2>
          <p className="text-center text-gray-600 mt-2">
            인증 토큰을 입력하여 서비스에 접속하세요
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="authToken"
            >
              인증 토큰
            </label>
            <input
              id="authToken"
              type="text"
              placeholder="예: eGSe9Dwg52k"
              value={authToken}
              onChange={e => setAuthToken(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading || !authToken.trim()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isLoading ? '인증 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
