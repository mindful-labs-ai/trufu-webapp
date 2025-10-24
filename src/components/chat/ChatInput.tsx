'use client';

import { useState, useEffect } from 'react';
import { MAX_MESSAGE_LENGTH } from '@/constants/validation';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const ChatInput = ({
  onSendMessage,
  disabled = false,
  placeholder = '메세지를 입력해주세요.',
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const isOverLimit = message.length >= MAX_MESSAGE_LENGTH;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (newValue.length > MAX_MESSAGE_LENGTH) {
      setIsShaking(true);
      return;
    }

    setMessage(newValue);
  };

  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isShaking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isOverLimit) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isMobile) {
        return;
      } else {
        if (!e.shiftKey) {
          e.preventDefault();
          handleSubmit(e);
        }
      }
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-border bg-card p-4">
      <div className="max-w-[720px] mx-auto">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <style jsx>{`
              @keyframes shake {
                0%,
                100% {
                  transform: translateX(0);
                }
                10%,
                30%,
                50%,
                70%,
                90% {
                  transform: translateX(-4px);
                }
                20%,
                40%,
                60%,
                80% {
                  transform: translateX(4px);
                }
              }
              .shake {
                animation: shake 0.5s;
              }
            `}</style>
            <textarea
              value={message}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={1}
              className={`overflow-y-auto w-full px-4 border rounded-2xl resize-none focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed bg-background text-foreground transition-colors ${
                isOverLimit
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-input focus:ring-primary focus:border-transparent'
              } ${isShaking ? 'shake' : ''}`}
              style={{
                fontSize: '16px',
                lineHeight: '1.5',
                padding: '11px 16px',
                height: '48px',
                maxHeight: '120px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!message.trim() || disabled || isOverLimit}
            className="px-6 bg-primary text-primary-foreground rounded-2xl hover:bg-primary-strong focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-muted-bg disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors h-[48px] flex items-center justify-center"
          >
            <img
              src="/paper-plane.svg"
              alt="Send message"
              className="w-5 h-5"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </button>
        </form>
      </div>
    </div>
  );
};
