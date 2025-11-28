import React from 'react';
import { cn } from './utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm hover:shadow-indigo-500/30',
      secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
      ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
      danger: 'bg-rose-900/20 text-rose-400 border border-rose-900/50 hover:bg-rose-900/40',
      outline: 'bg-transparent border border-slate-600 text-slate-300 hover:border-slate-400',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';