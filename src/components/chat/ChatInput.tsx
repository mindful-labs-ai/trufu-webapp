'use client';

import { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  onSendMessage,
  disabled = false,
  placeholder = '메세지를 입력해주세요.',
}: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="max-w-[720px] mx-auto">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="overflow-y-auto text-sm w-full px-4 py-3.5 border border-input rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-background text-foreground"
              style={{
                height: '50px',
                maxHeight: '120px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!message.trim() || disabled}
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
