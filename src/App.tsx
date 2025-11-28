import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';
import { checkConnection } from './lib/supabase';

// Components
import { PinTerminal } from './components/auth/PinTerminal';
import { MainLayout } from './components/layout/MainLayout';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SubmissionCard } from './components/analysis/SubmissionCard';
import { Toaster } from './components/ui/Toast';
import { Button } from './components/ui/Button';
import { Plus } from 'lucide-react';
import { generateId } from './lib/crypto';

function App() {
  const { isAuthenticated } = useAuthStore();
  const { submissions, addSubmission } = useDataStore();
  const [isOnline, setIsOnline] = useState(true);

  // Check backend health on mount
  useEffect(() => {
    checkConnection().then(setIsOnline);
  }, []);

  // Empty State Helper
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
      <div className="mb-6 h-32 w-32 rounded-full border-2 border-dashed border-slate-700 bg-slate-900/50 flex items-center justify-center">
        <Plus className="h-10 w-10 text-slate-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-300">Lab Bench is Empty</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        No submissions loaded. Add a student assignment to begin forensic analysis.
      </p>
      <Button 
        className="mt-6" 
        variant="outline" 
        onClick={() => addSubmission({
          id: generateId(),
          studentName: 'New Student',
          content: '',
          status: 'idle',
          result: null,
          lastUpdated: Date.now()
        })}
      >
        Initialize New Case
      </Button>
    </div>
  );

  return (
    <>
      <Toaster />
      
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white text-xs font-bold text-center py-1">
          SYSTEM OFFLINE: Backend connection lost. Functionality limited.
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PinTerminal />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MainLayout
              sidebar={<Sidebar />}
              header={<Header />}
            >
              <div className="space-y-6 pb-20">
                {submissions.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-2">
                    <AnimatePresence>
                      {submissions.map((sub) => (
                        <SubmissionCard key={sub.id} submission={sub} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </MainLayout>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;