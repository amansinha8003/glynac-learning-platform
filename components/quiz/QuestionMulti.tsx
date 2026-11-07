'use client';

import { MultiChoiceQuestion } from '@/types/learning';
import { Check, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuestionMultiProps {
  question: MultiChoiceQuestion;
  selectedAnswers?: number[];
  isLocked: boolean;
  onToggle: (optionIndex: number) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuestionMulti({
  question,
  selectedAnswers = [],
  isLocked,
  onToggle,
}: QuestionMultiProps) {
  return (
    <div
      role="group"
      aria-labelledby={`prompt-${question.id}`}
      className="space-y-3"
    >
      <div>
        <h2
          id={`prompt-${question.id}`}
          className="text-base sm:text-lg font-bold text-foreground leading-snug"
        >
          {question.prompt}
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
          <Info className="h-3.5 w-3.5" />
          <span>Select all that apply</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 pt-2">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswers.includes(idx);
          const isCorrect = question.correctAnswers.includes(idx);
          const isWrongSelection = isLocked && isSelected && !isCorrect;
          const isMissed = isLocked && !isSelected && isCorrect;

          let cardStyle = 'border-border bg-card hover:bg-muted/70 text-foreground';

          if (isLocked) {
            if (isSelected && isCorrect) {
              cardStyle = 'border-emerald-500/80 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold shadow-xs';
            } else if (isWrongSelection) {
              cardStyle = 'border-destructive/80 bg-destructive/10 text-destructive font-semibold shadow-xs';
            } else if (isMissed) {
              cardStyle = 'border-amber-500/60 bg-amber-500/10 text-amber-950 dark:text-amber-200 font-medium';
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
              role="checkbox"
              aria-checked={isSelected}
              disabled={isLocked}
              onClick={() => onToggle(idx)}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary ${cardStyle}`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {/* Checkbox box with Letter */}
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border transition-colors ${
                    isLocked && isSelected && isCorrect
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : isLocked && isWrongSelection
                      ? 'bg-destructive text-white border-destructive'
                      : isLocked && isMissed
                      ? 'bg-amber-500/30 text-amber-700 dark:text-amber-300 border-amber-500'
                      : isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  {isSelected ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    OPTION_LETTERS[idx] || idx + 1
                  )}
                </div>

                <span className="leading-snug">{option}</span>
              </div>

              {/* Status Labels */}
              <div className="shrink-0 flex items-center gap-2">
                {isLocked && isSelected && isCorrect && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30">
                    Correct
                  </Badge>
                )}
                {isLocked && isWrongSelection && (
                  <Badge variant="destructive" className="text-[10px]">
                    Incorrect
                  </Badge>
                )}
                {isLocked && isMissed && (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30">
                    Missed
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
