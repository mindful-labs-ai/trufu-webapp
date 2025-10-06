import { cn } from '@/utils/cn';
import React from 'react';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function IconButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'default',
          'text-gray-500 hover:bg-gray-100 hover:text-gray-900':
            variant === 'ghost',
          'text-red-500 hover:bg-red-50 hover:text-red-600':
            variant === 'danger',
        },
        {
          'h-8 w-8 text-sm': size === 'sm',
          'h-10 w-10': size === 'md',
          'h-12 w-12 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
