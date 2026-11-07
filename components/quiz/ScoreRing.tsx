'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface ScoreRingProps {
  scorePercent: number;
  isPassed: boolean;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({
  scorePercent,
  isPassed,
  size = 170,
  strokeWidth = 14,
}: ScoreRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scorePercent / 100) * circumference;

  const strokeColor = isPassed
    ? 'text-emerald-500 stroke-current'
    : 'text-destructive stroke-current';

  return (
    <div
      role="img"
      aria-label={`Quiz score: ${scorePercent} percent. Result: ${
        isPassed ? 'Passed' : 'Not passed'
      }`}
      className="relative flex items-center justify-center select-none shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] overflow-visible"
      >
        {/* Track background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted fill-transparent"
        />

        {/* Animated score stroke */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: shouldReduceMotion ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: 'easeOut' }}
          className={`fill-transparent ${strokeColor}`}
        />
      </svg>

      {/* Percentage Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.3 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-mono"
        >
          {scorePercent}%
        </motion.span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
          {isPassed ? 'Passed' : 'Score'}
        </span>
      </div>
    </div>
  );
}

