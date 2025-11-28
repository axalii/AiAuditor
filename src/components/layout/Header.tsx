import { useDataStore } from '../../store/useDataStore';
import { Button } from '../ui/Button';
import { Play, Plus } from 'lucide-react';
import { generateId } from '../../lib/crypto';

export const Header = () => {
  const { submissions, addSubmission, isGlobalAnalyzing } = useDataStore();

  const total = submissions.length;
  const analyzedCount = submissions.filter(s => s.status === 'done').length;
  
  // Calculate average score safely
  const totalScore = submissions.reduce((acc, curr) => acc + (curr.result?.aiScore || 0), 0);
  const avgScore = analyzedCount > 0 ? Math.round(totalScore / analyzedCount) : 0;

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

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleAddStudent}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
        <Button variant="primary" size="sm" disabled={total === 0 || isGlobalAnalyzing}>
          <Play className="mr-2 h-4 w-4" />
          {isGlobalAnalyzing ? 'Processing Batch...' : 'Analyze All'}
        </Button>
      </div>
    </header>
  );
};