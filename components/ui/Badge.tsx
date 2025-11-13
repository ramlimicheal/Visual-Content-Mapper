
import type { HTMLAttributes } from 'react';
import React from 'react';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variantClasses = variant === 'outline'
    ? 'border-transparent bg-slate-800 text-slate-100'
    : 'border-transparent bg-primary text-primary-foreground';

  return <div className={`${baseClasses} ${variantClasses} ${className || ''}`} {...props} />;
};
