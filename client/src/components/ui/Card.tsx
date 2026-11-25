import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = false,
  hover = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-5',
        hover && 'glass-hover',
        glow && 'glow-primary',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
