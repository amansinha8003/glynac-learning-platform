'use client';

import { SingleChoiceQuestion } from '@/types/learning';
import { Check, X } from 'lucide-react';

interface QuestionSingleProps {
  question: SingleChoiceQuestion;
  selectedAnswer?: number;
  isLocked: boolean;
  onSelect: (optionIndex: number) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuestionSingle({
  question,
  selectedAnswer,
  isLocked,
  onSelect,
}: QuestionSingleProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={`prompt-${question.id}`}
      className="space-y-3"
    >
      <h2
        id={`prompt-${question.id}`}
        className="text-base sm:text-lg font-bold text-foreground leading-snug"
      >
        {question.prompt}
      </h2>

      <div className="grid grid-cols-1 gap-2.5 pt-2">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = isLocked && idx === question.correctAnswer;
          const isWrongSelection = isLocked && isSelected && !isCorrect;

          let cardStyle = 'border-border bg-card hover:bg-muted/70 text-foreground';

          if (isLocked) {
            if (isCorrect) {
              cardStyle = 'border-emerald-500/80 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold shadow-xs';
            } else if (isWrongSelection) {
              cardStyle = 'border-destructive/80 bg-destructive/10 text-destructive font-semibold shadow-xs';
            } else {
              cardStyle = 'border-border/60 bg-card opacity-50 text-muted-foreground';
            }
          } else if (isSelected) {
            cardStyle = 'border-primary bg-primary/10 text-primary font-semibold shadow-xs ring-1 ring-primary';
          }

          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isLocked}
              onClick={() => onSelect(idx)}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary ${cardStyle}`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {/* Letter Badge A/B/C/D */}
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border transition-colors ${
                    isLocked && isCorrect
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : isLocked && isWrongSelection
                      ? 'bg-destructive text-white border-destructive'
                      : isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  {OPTION_LETTERS[idx] || idx + 1}
                </div>

                <span className="leading-snug">{option}</span>
              </div>

              {/* Status Indicator */}
              <div className="shrink-0">
                {isLocked && isCorrect && (
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                )}
                {isLocked && isWrongSelection && (
                  <X className="h-5 w-5 text-destructive stroke-[2.5]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

