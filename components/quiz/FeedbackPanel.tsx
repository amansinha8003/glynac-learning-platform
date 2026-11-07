'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

interface FeedbackPanelProps {
  isCorrect: boolean;
  explanation: string;
}

export function FeedbackPanel({ isCorrect, explanation }: FeedbackPanelProps) {
  const shouldReduceMotion = useReducedMotion();

  const animationVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animationVariants}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs space-y-2.5 ${
        isCorrect
          ? 'border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-950 dark:text-emerald-100'
          : 'border-destructive/40 bg-destructive/10 dark:bg-destructive/15 text-destructive'
      }`}
    >
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
            <h3 className="font-bold text-sm sm:text-base text-emerald-700 dark:text-emerald-300">
              Correct! Outstanding answer.
            </h3>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-destructive stroke-[2.5]" />
            <h3 className="font-bold text-sm sm:text-base text-destructive">
              Incorrect answer
            </h3>
          </>
        )}
      </div>

      <div className="flex items-start gap-2 pt-1 text-xs sm:text-sm text-foreground/90 leading-relaxed border-t border-border/40">
        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
            Explanation:
          </span>
          <p>{explanation}</p>
        </div>
      </div>
    </motion.div>
  );
}

