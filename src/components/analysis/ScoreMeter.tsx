import { motion } from 'framer-motion';

interface ScoreMeterProps {
  score: number; // 0-100
  size?: number;
}

export const ScoreMeter = ({ score, size = 60 }: ScoreMeterProps) => {
  const radius = size / 2 - 4; // 4px stroke width
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Determine color
  let colorClass = 'text-emerald-500';
  if (score > 30) colorClass = 'text-amber-400';
  if (score > 70) colorClass = 'text-rose-500';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-slate-800"
        />
        {/* Progress Circle */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={colorClass}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold font-mono ${colorClass}`}>{score}%</span>
      </div>
    </div>
  );
};