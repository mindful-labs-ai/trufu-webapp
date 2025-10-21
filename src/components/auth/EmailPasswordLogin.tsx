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

      await initializeUser();
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
      <div className="bg-card rounded-2xl px-8 pt-6 pb-8 mb-4 border border-border">
        <div className="mb-6">
          <h2 className="text-2xl pb-2 font-bold text-center text-foreground">
            섬세한 마음의 항해법 - 도포 AI
          </h2>
          <p className="text-center text-muted-foreground mt-2">
            전자책 구매자만 이용 가능한 베타서비스 입니다.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="block text-foreground text-sm font-bold mb-2"
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
              className="appearance-none border border-input rounded-2xl w-full py-2 px-3 text-foreground leading-tight focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <label
                className="block text-foreground text-sm font-bold"
                htmlFor="password"
              >
                비밀번호
              </label>
              <div className="relative ml-2 group">
                <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground flex items-center justify-center cursor-help">
                  <span className="text-xs text-muted-foreground">?</span>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-10">
                  로그인 이메일은 전자책을 구매할 때 사용된 이메일과 동일하며
                  초기 비밀번호는 주문번호 입니다.
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
                </div>
              </div>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="appearance-none border border-input rounded-2xl w-full py-2 px-3 text-foreground leading-tight focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-2xl">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="bg-primary text-primary-foreground rounded-2xl hover:bg-primary-strong focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-muted-bg disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors font-bold py-3 px-4 w-full"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              계속하여,{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                서비스 이용약관
              </a>
              에 동의합니다.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
