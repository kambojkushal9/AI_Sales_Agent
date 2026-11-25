import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const styles = {
    default: 'bg-white/10 text-gray-300 border-white/10',
    primary: 'bg-primary/15 text-purple-300 border-primary/30',
    secondary: 'bg-secondary/15 text-cyan-300 border-secondary/30',
    success: 'bg-success/15 text-emerald-300 border-success/30',
    warning: 'bg-warning/15 text-amber-300 border-warning/30',
    error: 'bg-error/15 text-rose-300 border-error/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
