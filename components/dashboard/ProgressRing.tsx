'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number;
  stroke?: number;
  label?: string;
  showValueText?: boolean;
  className?: string;
  colorClassName?: string;
}

export function ProgressRing({
  value,
  size = 80,
  stroke = 8,
  label,
  showValueText = true,
  className = '',
  colorClassName = 'text-primary stroke-current',
}: ProgressRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  const accessibleLabel = label
    ? `${label}: ${clampedValue}% completed`
    : `${clampedValue}% completed`;

  return (
    <div
      role="img"
      aria-label={accessibleLabel}
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] overflow-visible"
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-muted fill-transparent"
        />

        {/* Animated value stroke */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: shouldReduceMotion ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: 'easeOut' }}
          className={`fill-transparent ${colorClassName}`}
        />
      </svg>

      {/* Center Value Text */}
      {showValueText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : 0.2 }}
            className="text-xs sm:text-sm font-bold tracking-tight text-foreground font-mono tabular-nums"
          >
            {clampedValue}%
          </motion.span>
        </div>
      )}
    </div>
  );
}

