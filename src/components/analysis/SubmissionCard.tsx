import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit2, Save, X, Microscope } from 'lucide-react';
import { toast } from 'sonner';

import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { analyzeSubmission, getErrorMessage } from '../../lib/api';
import { Submission } from '../../types';

import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
// Removed unused Skeleton import
import { ScoreMeter } from './ScoreMeter';
import { ReasoningDisplay } from './ReasoningDisplay';
import { DuplicateWarning } from './DuplicateWarning';
import { cn } from '../ui/utils'; // Added missing import

interface SubmissionCardProps {
  submission: Submission;
}

export const SubmissionCard = ({ submission }: SubmissionCardProps) => {
  const { sessionToken } = useAuthStore();
  const { 
    updateSubmission, 
    removeSubmission, 
    setSubmissionResult, 
    setSubmissionStatus, 
    assignmentContext 
  } = useDataStore();

  const [isEditing, setIsEditing] = useState(submission.content.length === 0);
  const [localContent, setLocalContent] = useState(submission.content);
  const [localName, setLocalName] = useState(submission.studentName);

  useEffect(() => {
    setLocalContent(submission.content);
  }, [submission.content]);

  const handleAnalyze = async () => {
    if (!sessionToken) {
      toast.error('Session Expired', { description: 'Please re-authenticate.' });
      return;
    }
    if (!localContent.trim()) {
      toast.error('Empty Submission', { description: 'Please paste student text first.' });
      return;
    }

    setSubmissionStatus(submission.id, 'analyzing');

    try {
      const result = await analyzeSubmission(localContent, assignmentContext, sessionToken);
      
      // FIX: Add the missing timestamp here
      setSubmissionResult(submission.id, {
        ...result,
        timestamp: new Date().toISOString()
      });
      
      toast.success('Analysis Complete', { description: `Score: ${result.aiScore}%` });
    } catch (error) {
      const msg = getErrorMessage(error);
      setSubmissionStatus(submission.id, 'error', msg);
      toast.error('Analysis Failed', { description: msg });
    }
  };

  const handleSave = () => {
    updateSubmission(submission.id, { 
      content: localContent, 
      studentName: localName,
      status: 'idle',
      result: null 
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:border-slate-700 hover:shadow-lg"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <input
              className="bg-transparent border-b border-slate-700 text-lg font-bold text-white focus:outline-none focus:border-indigo-500"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Student Name"
            />
          ) : (
            <h3 className="text-lg font-bold text-slate-100">{submission.studentName}</h3>
          )}
          
          {!isEditing && submission.status === 'done' && submission.result && (
            <div className="flex gap-2">
              <Badge variant={submission.result.aiScore > 50 ? 'danger' : 'success'}>
                {submission.result.aiScore > 50 ? 'AI Detected' : 'Human Likely'}
              </Badge>
              {submission.result.isDuplicate && <DuplicateWarning />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {isEditing ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
              <Button size="sm" variant="primary" onClick={handleSave}><Save className="h-4 w-4" /></Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}><Edit2 className="h-4 w-4" /></Button>
              <Button size="sm" variant="danger" onClick={() => removeSubmission(submission.id)}><Trash2 className="h-4 w-4" /></Button>
            </>
          )}
        </div>
      </div>

      <div className="relative min-h-[120px]">
        {isEditing ? (
          <textarea
            className="w-full h-48 rounded-md bg-slate-950/50 border border-slate-800 p-4 text-sm text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-serif leading-relaxed resize-none"
            placeholder="Paste student assignment here..."
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
          />
        ) : (
          <div className="relative">
            <div className={cn(
              "p-4 rounded-md bg-slate-950/30 border border-slate-800/50 text-sm text-slate-300 font-serif leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto",
              submission.status === 'analyzing' && "opacity-50 blur-[1px]"
            )}>
              {submission.content || <span className="text-slate-600 italic">No content provided.</span>}
            </div>

            {submission.status === 'analyzing' && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-indigo-500/30 animate-ping absolute" />
                    <Microscope className="h-12 w-12 text-indigo-400 animate-pulse" />
                  </div>
                  <span className="text-xs font-mono text-indigo-300 animate-pulse">Scanning Patterns...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="mt-6 flex flex-col gap-4">
          {submission.status === 'idle' && (
            <Button className="w-full" onClick={handleAnalyze}>
              Analyze This Submission
            </Button>
          )}

          {submission.status === 'error' && (
            <div className="flex items-center justify-between rounded-md bg-rose-950/20 p-3 border border-rose-900/30">
              <span className="text-xs text-rose-400">{submission.errorMessage}</span>
              <Button size="sm" variant="outline" onClick={handleAnalyze}>Retry</Button>
            </div>
          )}

          {submission.status === 'done' && submission.result && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t border-slate-800 pt-4"
            >
              <div className="flex items-center gap-6 mb-4">
                <ScoreMeter score={submission.result.aiScore} />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-200">Analysis Result</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Model: <span className="font-mono text-indigo-400">{submission.result.modelUsed}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Confidence: <span className="text-slate-300">High</span>
                  </p>
                </div>
              </div>
              <ReasoningDisplay markdown={submission.result.reasoning} />
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};