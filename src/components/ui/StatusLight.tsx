import { cn } from './utils';

interface StatusLightProps {
  status: 'online' | 'offline' | 'busy';
  label?: string;
}

export const StatusLight = ({ status, label }: StatusLightProps) => {
  const colors = {
    online: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    offline: 'bg-slate-500',
    busy: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn('h-2 w-2 rounded-full transition-all duration-500', colors[status])} />
      {label && <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{label}</span>}
    </div>
  );
};