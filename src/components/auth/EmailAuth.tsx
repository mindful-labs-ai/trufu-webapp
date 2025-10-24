'use client';

import { checkEmailExists } from '@/app/actions/auth';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import React, { useState } from 'react';
import { parseAuthError } from '@/utils/auth-error';
import { validateEmailPassword, validateSignUp } from '@/utils/auth-validation';

type AuthMode = 'login' | 'signup';

interface EmailAuthProps {
  mode: AuthMode;
  onLoginSuccess?: () => void;
  onSignUpSuccess?: () => void;
  onError?: (error: string) => void;
  onModeChange?: (mode: AuthMode) => void;
}

export const EmailAuth: React.FC<EmailAuthProps> = ({
  mode,
  onLoginSuccess,
  onSignUpSuccess,
  onError,
  onModeChange,
}) => {
  const initializeUser = useUserStore(s => s.initialize);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === 'signup';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const redirectParam = new URLSearchParams(window.location.search).get('redirect');
      const callbackUrl = redirectParam
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectParam)}`
        : `${window.location.origin}/auth/callback`;

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err) {
      const errorMessage = parseAuthError(err as Error);
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    const { exists, error: checkError } = await checkEmailExists(email.trim());

    if (checkError) {
      throw new Error(checkError);
    }

    if (exists) {
      throw new Error('User already registered');
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!data.user) {
      throw new Error('회원가입에 실패했습니다.');
    }

    onSignUpSuccess?.();
    setError(null);
  };

  const handleLogin = async () => {
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: email.trim(),
        password: password.trim(),
      }
    );

    if (signInError) {
      throw signInError;
    }

    if (!data.user) {
      throw new Error('로그인에 실패했습니다.');
    }

    await initializeUser();

    onLoginSuccess?.();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = isSignUp
      ? validateSignUp(email, password, passwordConfirm)
      : validateEmailPassword(email, password);

    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await handleSignUp();
      } else {
        await handleLogin();
      }
    } catch (err) {
      const errorMessage = parseAuthError(err as Error);
      setError(errorMessage);
      onError?.(errorMessage);
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

        <form onSubmit={handleSubmit}>
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

          <div className="mb-4">
            <label
              className="block text-foreground text-sm font-bold mb-2"
              htmlFor="password"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder={isSignUp ? '8자 이상 입력' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="appearance-none border border-input rounded-2xl w-full py-2 px-3 text-foreground leading-tight focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              disabled={isLoading}
            />
          </div>

          <div
            className={`transition-all duration-700 ease-in-out ${
              isSignUp ? 'opacity-100 max-h-32 mb-4' : 'opacity-0 max-h-0 mb-0'
            }`}
          >
            <label
              className="block text-foreground text-sm font-bold mb-2"
              htmlFor="password-confirm"
            >
              비밀번호 확인
            </label>
            <input
              id="password-confirm"
              type="password"
              placeholder="비밀번호 재입력"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              className="appearance-none border border-input rounded-2xl w-full py-2 px-3 text-foreground leading-tight focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              disabled={isLoading || !isSignUp}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-2xl">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={
                isLoading ||
                !email.trim() ||
                !password.trim() ||
                (isSignUp && !passwordConfirm.trim())
              }
              className="bg-primary z-10 text-primary-foreground rounded-2xl hover:bg-primary-strong focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-muted-bg disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors font-bold py-3 px-4 w-full"
            >
              {isLoading
                ? isSignUp
                  ? '가입 중...'
                  : '로그인 중...'
                : isSignUp
                  ? '회원가입'
                  : '로그인'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 bg-background border border-input rounded-2xl hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold py-3 px-4 w-full"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 계속하기
            </button>
          </div>

          <div className="mt-4 text-center">
            {onModeChange && (
              <div className="mb-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}{' '}
                  <button
                    type="button"
                    onClick={() => onModeChange(isSignUp ? 'login' : 'signup')}
                    className="text-primary hover:text-primary-strong font-bold underline"
                  >
                    {isSignUp ? '로그인' : '회원가입'}
                  </button>
                </p>
              </div>
            )}
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
