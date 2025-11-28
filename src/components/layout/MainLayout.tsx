import { useAppStore } from '../../store/useAppStore';
import { cn } from '../ui/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

export const MainLayout = ({ children, sidebar, header }: MainLayoutProps) => {
  const { isSidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {/* Dot Grid Background */}
      <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none z-0" />
      
      {sidebar}

      <div className={cn("relative z-10 flex flex-col min-h-screen transition-all duration-300", isSidebarCollapsed ? "ml-0" : "ml-80")}>
        {header}
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};