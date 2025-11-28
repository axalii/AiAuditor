import { cn } from './utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300',
    success: 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50',
    warning: 'bg-amber-900/30 text-amber-400 border border-amber-900/50',
    danger: 'bg-rose-900/30 text-rose-400 border border-rose-900/50',
    outline: 'border border-slate-700 text-slate-400',
  };

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  );
};