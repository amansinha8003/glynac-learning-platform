'use client';

import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number;
  caption: string;
  icon: LucideIcon;
  suffix?: string;
  precision?: number;
}

export function StatCard({
  title,
  value,
  caption,
  icon: Icon,
  suffix = '',
  precision = 0,
}: StatCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    let startTimestamp: number | null = null;
    const durationMs = 1000;
    const startVal = 0;
    const endVal = value;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, shouldReduceMotion]);

  const activeNumber = shouldReduceMotion ? value : displayValue;
  const formattedValue =
    precision > 0 ? activeNumber.toFixed(precision) : Math.round(activeNumber).toString();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between gap-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="h-10 w-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center shrink-0 shadow-2xs">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
          {formattedValue}
          {suffix}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          {caption}
        </p>
      </div>
    </motion.div>
  );
}
