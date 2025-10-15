'use client';

import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import React, { useState } from 'react';

interface EmailPasswordLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const EmailPasswordLogin: React.FC<EmailPasswordLoginProps> = ({
  onSuccess,
  onError,
}) => {
  const initializeUser = useUserStore(s => s.initialize);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error('로그인에 실패했습니다.');
      }

      await initializeUser({ force: true });
      onSuccess?.();
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';

      let displayError = errorMessage;
      if (errorMessage.includes('Invalid login credentials')) {
        displayError = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (errorMessage.includes('Email not confirmed')) {
        displayError = '이메일 인증이 필요합니다.';
      }

      setError(displayError);
      onError?.(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-gray-700">
            이메일 로그인
          </h2>
          <p className="text-center text-gray-600 mt-2">
            이메일과 비밀번호로 로그인하세요
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
              disabled={isLoading || !email.trim() || !password.trim()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
