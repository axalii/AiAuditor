import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { cn } from '../ui/utils';
import { Button } from '../ui/Button';
import { StatusLight } from '../ui/StatusLight';
import { LogOut, Shield, ShieldAlert, LayoutDashboard } from 'lucide-react';

export const Sidebar = () => {
  const { isSidebarCollapsed, privacyMode, setPrivacyMode } = useAppStore();
  const { logout, userLabel } = useAuthStore();
  const { assignmentContext, setContext } = useDataStore();

  if (isSidebarCollapsed) return null;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-80 border-r border-slate-800 bg-slate-900/95 backdrop-blur-md flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <LayoutDashboard className="mr-2 h-5 w-5 text-indigo-500" />
        <span className="font-bold text-slate-100 tracking-wide">AI FORENSICS</span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Context Area */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Assignment Context
          </label>
          <textarea
            className="w-full h-40 rounded-md border border-slate-700 bg-slate-800/50 p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none transition-all"
            placeholder="Paste the assignment prompt or questions here. This helps the AI understand what the student SHOULD have written."
            value={assignmentContext}
            onChange={(e) => setContext(e.target.value)}
          />
          <p className="text-[10px] text-slate-500">
            Context improves detection accuracy by 35%.
          </p>
        </div>

        {/* Privacy Toggle */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Data Privacy
          </label>
          <div 
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
              privacyMode 
                ? "bg-indigo-900/20 border-indigo-500/50" 
                : "bg-slate-800/30 border-slate-700 hover:border-slate-600"
            )}
            onClick={() => setPrivacyMode(!privacyMode)}
          >
            <div className="flex items-center gap-3">
              {privacyMode ? <Shield className="h-5 w-5 text-indigo-400" /> : <ShieldAlert className="h-5 w-5 text-slate-500" />}
              <div className="flex flex-col">
                <span className={cn("text-sm font-medium", privacyMode ? "text-indigo-300" : "text-slate-300")}>
                  {privacyMode ? "Incognito Mode" : "Standard Mode"}
                </span>
                <span className="text-[10px] text-slate-500">
                  {privacyMode ? "No data logged to server" : "Analysis logged for history"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / User Info */}
      <div className="border-t border-slate-800 p-4 bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-300">{userLabel || 'Authorized User'}</span>
            <span className="text-[10px] text-slate-500">Secure Connection</span>
          </div>
          <StatusLight status="online" />
        </div>
        <Button variant="secondary" size="sm" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Terminate Session
        </Button>
      </div>
    </aside>
  );
};