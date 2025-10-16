'use client';

import { changePassword } from '@/services/user.service';
import { useUserStore } from '@/stores/userStore';
import React, { useState } from 'react';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSuccess,
}) => {
  const me = useUserStore(s => s.me);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!me?.email) {
      setError('로그인 후 다시 시도해주세요.');
      return;
    }

    if (!currentPassword.trim()) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!newPassword.trim()) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.trim().length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await changePassword({
        email: me.email,
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      setSuccessMessage('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.';

      let displayMessage = message;
      if (message.includes('Invalid login credentials')) {
        displayMessage = '현재 비밀번호가 올바르지 않습니다.';
      } else if (
        message.includes('Password should be at least') ||
        message.includes('Password length should be at least')
      ) {
        displayMessage = '새 비밀번호는 최소 6자 이상이어야 합니다.';
      } else if (
        message.toLowerCase().includes('same as the old password') ||
        message.toLowerCase().includes('same as old password')
      ) {
        displayMessage = '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
      }

      setError(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-gray-700">
            비밀번호 변경
          </h2>
          <p className="text-center text-gray-600 mt-2">
            현재 비밀번호를 확인하고 새 비밀번호를 설정하세요
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="current-password"
            >
              현재 비밀번호
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={event => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="new-password"
            >
              새 비밀번호
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
              autoComplete="new-password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-2">
              영문, 숫자 조합 8자 이상을 권장합니다.
            </p>
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirm-password"
            >
              새 비밀번호 확인
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isLoading ||
              !currentPassword.trim() ||
              !newPassword.trim() ||
              !confirmPassword.trim()
            }
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {isLoading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  );
};
