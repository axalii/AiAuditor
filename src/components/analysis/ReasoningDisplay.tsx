import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface ReasoningDisplayProps {
  markdown: string;
}

export const ReasoningDisplay = ({ markdown }: ReasoningDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between bg-slate-800/50 px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400 hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-indigo-400" />
          Forensic Analysis Report
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="p-4 text-sm leading-relaxed text-slate-300">
          <ReactMarkdown
            components={{
              strong: ({ node, ...props }) => (
                <span className="bg-yellow-500/20 text-yellow-200 px-1 rounded font-semibold border-b border-yellow-500/40" {...props} />
              ),
              ul: ({ node, ...props }) => <ul className="space-y-2 my-2" {...props} />,
              li: ({ node, ...props }) => (
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                  <span {...props} />
                </li>
              ),
              p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </motion.div>
    </div>
  );
};