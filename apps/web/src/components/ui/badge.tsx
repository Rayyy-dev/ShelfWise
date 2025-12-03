import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-semibold rounded-full';

    const variants = {
      default: 'bg-primary-100/80 text-primary-700 border border-primary-200/50',
      success: 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50',
      warning: 'bg-amber-100/80 text-amber-700 border border-amber-200/50',
      danger: 'bg-red-100/80 text-red-700 border border-red-200/50',
      info: 'bg-blue-100/80 text-blue-700 border border-blue-200/50',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
