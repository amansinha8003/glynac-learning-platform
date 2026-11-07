'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface QuestionNavigatorProps {
  currentIndex: number;
  totalQuestions: number;
  answeredIndices: Set<number>;
  checkedIndices: Set<number>;
  canGoNext: boolean;
  isLastQuestion: boolean;
  isCheckedCurrent: boolean;
  onNavigate: (index: number) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
  onFinishQuiz: () => void;
}

export function QuestionNavigator({
  currentIndex,
  totalQuestions,
  answeredIndices,
  checkedIndices,
  canGoNext,
  isLastQuestion,
  isCheckedCurrent,
  onNavigate,
  onCheckAnswer,
  onNextQuestion,
  onFinishQuiz,
}: QuestionNavigatorProps) {
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      {/* Progress Bar & Counter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span>{progressPercent}% completed</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      {/* Numbered Dots Navigator */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isCurrent = idx === currentIndex;
          const isChecked = checkedIndices.has(idx);
          const isAnswered = answeredIndices.has(idx);

          let buttonStyle = 'bg-muted border-border text-muted-foreground hover:bg-muted/80';

          if (isCurrent) {
            buttonStyle = 'bg-primary text-primary-foreground border-primary font-bold shadow-xs ring-2 ring-primary/40';
          } else if (isChecked) {
            buttonStyle = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-semibold';
          } else if (isAnswered) {
            buttonStyle = 'bg-card text-foreground border-foreground/40 font-semibold';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(idx)}
              aria-label={`Jump to question ${idx + 1}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={`h-8 w-8 rounded-lg text-xs font-mono transition-all flex items-center justify-center border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${buttonStyle}`}
            >
              {isChecked ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : idx + 1}
            </button>
          );
        })}
      </div>

      {/* Action Buttons: Prev, Check Answer, Next / Finish */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Previous Question Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentIndex === 0}
          onClick={() => onNavigate(currentIndex - 1)}
          className="h-9 px-3 text-xs font-semibold gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {/* Center / Right primary actions */}
        <div className="flex items-center gap-2">
          {!isCheckedCurrent ? (
            <Button
              type="button"
              size="sm"
              disabled={!canGoNext}
              onClick={onCheckAnswer}
              className="h-9 px-4 text-xs font-semibold shadow-xs"
            >
              Check Answer
            </Button>
          ) : isLastQuestion ? (
            <Button
              type="button"
              size="sm"
              onClick={onFinishQuiz}
              className="h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
            >
              Finish Quiz
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onNextQuestion}
              className="h-9 px-4 text-xs font-semibold shadow-xs gap-1"
            >
              <span>Next Question</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

