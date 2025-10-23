'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const TOAST_STYLES: Record<ToastType, string> = {
  info: 'bg-blue-500/90 border-blue-600',
  success: 'bg-green-500/90 border-green-600',
  error: 'bg-red-500/90 border-red-600',
  warning: 'bg-yellow-500/90 border-yellow-600',
};

const TOAST_ICONS: Record<ToastType, string> = {
  info: '📢',
  success: '✅',
  error: '❌',
  warning: '⚠️',
};

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 select-none ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      onClick={() => setIsVisible(false)}
    >
      <div
        className={`${TOAST_STYLES[type]} text-white px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 min-w-[300px] max-w-md`}
      >
        <span className="text-lg shadow-2xl">{TOAST_ICONS[type]}</span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
