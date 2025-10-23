'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '@/components/common/Toast';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  /**
   * 토스트 알림을 표시합니다.
   * @param message - 표시할 메시지
   * @param type - 토스트 타입 ('info' | 'success' | 'error' | 'warning'), 기본값: 'info'
   * @param duration - 토스트가 표시되는 시간(ms), 기본값: 3000
   */
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

/**
 * 토스트 알림을 표시하기 위한 커스텀 훅
 *
 * @returns showToast 함수를 포함한 객체
 *
 * @example
 *   const { showToast } = useToast();
 *
 *   const handleSuccess = () => {
 *     showToast('작업이 완료되었습니다', 'success');
 *   };
 *
 *   const handleError = () => {
 *     showToast('오류가 발생했습니다', 'error', 5000);
 *   };
 *
 *   const handleInfo = () => {
 *     showToast('알림 메시지입니다'); // 기본 타입은 'info'
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>성공 토스트</button>
 *       <button onClick={handleError}>에러 토스트 (5초)</button>
 *       <button onClick={handleInfo}>정보 토스트</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @throws {Error} ToastProvider 외부에서 사용 시 에러 발생
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
