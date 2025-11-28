import { useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAppStore } from '../../store/useAppStore'; 
import { useAuthStore } from '../../store/useAuthStore';
import { analyzeSubmission, getErrorMessage } from '../../lib/api';
import { Button } from '../ui/Button';
import { Play, Plus, Zap, BrainCircuit } from 'lucide-react';
import { generateId } from '../../lib/crypto';
import { toast } from 'sonner';

export const Header = () => {
  const { submissions, addSubmission, isGlobalAnalyzing, setGlobalAnalyzing, setSubmissionResult, setSubmissionStatus, assignmentContext } = useDataStore();
  const { selectedModel, setSelectedModel } = useAppStore();
  const { sessionToken } = useAuthStore();

  const total = submissions.length;
  const analyzedCount = submissions.filter(s => s.status === 'done').length;
  const totalScore = submissions.reduce((acc, curr) => acc + (curr.result?.aiScore || 0), 0);
  const avgScore = analyzedCount > 0 ? Math.round(totalScore / analyzedCount) : 0;

  const handleAnalyzeAll = async () => {
    if (!sessionToken) return toast.error("Session Expired");
    
    setGlobalAnalyzing(true);
    const pending = submissions.filter(s => s.status === 'idle' || s.status === 'error');
    
    if (pending.length === 0) {
      toast.info("Nothing to analyze", { description: "All loaded submissions are already done." });
      setGlobalAnalyzing(false);
      return;
    }

    toast.info(`Batch Analysis Started`, { description: `Processing ${pending.length} submissions...` });

    for (const sub of pending) {
      if (!sub.content.trim()) continue;
      
      setSubmissionStatus(sub.id, 'analyzing');
      try {
        const result = await analyzeSubmission(sub.content, assignmentContext, sessionToken, selectedModel);
        setSubmissionResult(sub.id, { ...result, timestamp: new Date().toISOString() });
      } catch (error) {
        setSubmissionStatus(sub.id, 'error', getErrorMessage(error));
      }
      await new Promise(r => setTimeout(r, 500));
    }

    setGlobalAnalyzing(false);
    toast.success("Batch Complete");
  };

  const handleAddStudent = () => {
    addSubmission({
      id: generateId(),
      studentName: 'New Student',
      content: '',
      status: 'idle',
      result: null,
      lastUpdated: Date.now(),
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-8 backdrop-blur-md">
      
      {/* Stats Ticker */}
      <div className="flex items-center gap-6 font-mono text-sm">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase">Submissions</span>
          <span className="text-slate-200 font-bold">{total}</span>
        </div>
        <div className="h-8 w-px bg-slate-800" />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase">Avg. AI Score</span>
          <span className={`font-bold ${avgScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {avgScore}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* MODEL SWITCHER */}
        <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            onClick={() => setSelectedModel('models/gemini-flash-latest')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedModel === 'models/gemini-flash-latest' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3 w-3" />
            Flash Latest
          </button>
          <button
            onClick={() => setSelectedModel('models/gemini-2.5-pro')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedModel === 'models/gemini-2.5-pro' 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="h-3 w-3" />
            Pro 2.5
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleAddStudent}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleAnalyzeAll} 
            disabled={total === 0 || isGlobalAnalyzing}
          >
            <Play className="mr-2 h-4 w-4" />
            {isGlobalAnalyzing ? 'Processing...' : 'Analyze All'}
          </Button>
        </div>
      </div>
    </header>
  );
};