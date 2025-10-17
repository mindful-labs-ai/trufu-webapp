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
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-muted text-foreground hover:bg-muted': variant === 'default',
          'text-muted-foreground hover:bg-muted hover:text-foreground':
            variant === 'ghost',
          'text-destructive hover:bg-destructive/10 hover:text-destructive':
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
