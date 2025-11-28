import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { verifyPin, getErrorMessage } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const PinTerminal = () => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;

    setIsLoading(true);
    setError(null);

    try {
      const session = await verifyPin(pin);
      login(session.token, session.label);
    } catch (err) {
      setError(getErrorMessage(err));
      setPin(''); // Clear input on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200 font-mono p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 rounded-xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50 border border-slate-700">
            <Lock className="h-6 w-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Security Checkpoint</h2>
          <p className="text-sm text-slate-400">Enter your access PIN to proceed to the lab.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <motion.div
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <Input
                type="password"
                placeholder="• • • • • •"
                className="text-center text-2xl tracking-[0.5em] h-14 font-bold"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </motion.div>
            {error && (
              <div className="flex items-center justify-center gap-2 text-xs text-rose-400">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base" 
            isLoading={isLoading}
            disabled={pin.length < 4}
          >
            {isLoading ? 'Verifying Credentials...' : 'Access Terminal'}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-600">
          <p>Restricted Access. All activities are logged.</p>
          <p className="mt-1">System v2.0.4 (Secure Core)</p>
        </div>
      </motion.div>
    </div>
  );
};