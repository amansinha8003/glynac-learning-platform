'use client';

import { useState, useMemo } from 'react';
import { Quiz } from '@/types/learning';
import { isAnswered, QuestionAnswer } from '@/lib/quiz';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Check,
  X,
  Lightbulb,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ResultBreakdownProps {
  quiz: Quiz;
  answers: Record<string, QuestionAnswer>;
  perQuestionResult: Record<string, boolean>;
}

type FilterTab = 'all' | 'incorrect' | 'correct' | 'unanswered';

export function ResultBreakdown({
  quiz,
  answers,
  perQuestionResult,
}: ResultBreakdownProps) {
  // Counts
  const { correctIds, incorrectIds, unansweredIds } = useMemo(() => {
    const correct = new Set<string>();
    const incorrect = new Set<string>();
    const unanswered = new Set<string>();

    quiz.questions.forEach((q) => {
      const answered = isAnswered(q, answers[q.id]);
      const isCorrect = perQuestionResult[q.id] === true;

      if (!answered) {
        unanswered.add(q.id);
      } else if (isCorrect) {
        correct.add(q.id);
      } else {
        incorrect.add(q.id);
      }
    });

    return { correctIds: correct, incorrectIds: incorrect, unansweredIds: unanswered };
  }, [quiz.questions, answers, perQuestionResult]);

  // Expanded items (default: incorrect and unanswered)
  const defaultExpanded = useMemo(() => {
    const set = new Set<string>();
    incorrectIds.forEach((id) => set.add(id));
    unansweredIds.forEach((id) => set.add(id));
    // If all are correct, expand all
    if (set.size === 0) {
      quiz.questions.forEach((q) => set.add(q.id));
    }
    return set;
  }, [incorrectIds, unansweredIds, quiz.questions]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(defaultExpanded);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllExpanded = expandedIds.size === quiz.questions.length;

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(quiz.questions.map((q) => q.id)));
    }
  };

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return quiz.questions.filter((q) => {
      if (activeTab === 'correct') return correctIds.has(q.id);
      if (activeTab === 'incorrect') return incorrectIds.has(q.id);
      if (activeTab === 'unanswered') return unansweredIds.has(q.id);
      return true;
    });
  }, [quiz.questions, activeTab, correctIds, incorrectIds, unansweredIds]);

  return (
    <div className="space-y-4">
      {/* Header with Filter Tabs & Expand All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        {/* Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-muted/60 text-xs font-semibold overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({quiz.questions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('incorrect')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'incorrect'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Incorrect ({incorrectIds.size})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('correct')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'correct'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Correct ({correctIds.size})
          </button>

          {unansweredIds.size > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('unanswered')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'unanswered'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unanswered ({unansweredIds.size})
            </button>
          )}
        </div>

        {/* Expand All / Collapse All */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleExpandAll}
          className="h-8 px-2 text-xs font-semibold text-primary gap-1 self-end sm:self-auto"
        >
          <ChevronsUpDown className="h-3.5 w-3.5" />
          <span>{isAllExpanded ? 'Collapse all' : 'Expand all'}</span>
        </Button>
      </div>

      {/* Question Accordion List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedIds.has(q.id);
          const isCorrect = correctIds.has(q.id);
          const isUnanswered = unansweredIds.has(q.id);
          const userAnswer = answers[q.id];

          return (
            <div
              key={q.id}
              className={`rounded-2xl border transition-all overflow-hidden bg-card ${
                isCorrect
                  ? 'border-emerald-500/30'
                  : isUnanswered
                  ? 'border-muted-foreground/30'
                  : 'border-destructive/30'
              }`}
            >
              {/* Collapsible Header */}
              <button
                type="button"
                onClick={() => toggleExpand(q.id)}
                aria-expanded={isExpanded}
                className="w-full p-4 sm:p-5 flex items-start justify-between gap-3 text-left hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  {/* Status Icon */}
                  <div className="shrink-0 mt-0.5">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : isUnanswered ? (
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground">
                        Question {idx + 1}
                      </span>
                      <Badge
                        variant={
                          isCorrect
                            ? 'default'
                            : isUnanswered
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="text-[10px] h-5 px-1.5"
                      >
                        {isCorrect
                          ? 'Correct'
                          : isUnanswered
                          ? 'Unanswered'
                          : 'Incorrect'}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                      {q.prompt}
                    </h3>
                  </div>
                </div>

                <div className="shrink-0 text-muted-foreground pt-1">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-border/50">
                  {/* Single & Multi Question Options Breakdown */}
                  {(q.type === 'single' || q.type === 'multi') && (
                    <div className="space-y-2 pt-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Answer Choices & Selections
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((option, optIdx) => {
                          const isSelected =
                            q.type === 'single'
                              ? userAnswer === optIdx
                              : Array.isArray(userAnswer) &&
                                (userAnswer as number[]).includes(optIdx);

                          const isTarget =
                            q.type === 'single'
                              ? q.correctAnswer === optIdx
                              : q.correctAnswers.includes(optIdx);

                          const isWrongSelect = isSelected && !isTarget;
                          const isMissed = !isSelected && isTarget;

                          let rowClass = 'bg-background border-border text-foreground';
                          if (isSelected && isTarget) {
                            rowClass =
                              'bg-emerald-500/10 border-emerald-500/60 text-emerald-950 dark:text-emerald-200 font-semibold';
                          } else if (isWrongSelect) {
                            rowClass =
                              'bg-destructive/10 border-destructive/60 text-destructive font-semibold';
                          } else if (isMissed) {
                            rowClass =
                              'bg-amber-500/10 border-amber-500/50 text-amber-950 dark:text-amber-200 font-medium';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm ${rowClass}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`h-5 w-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                                    isSelected && isTarget
                                      ? 'bg-emerald-500 text-white border-emerald-500'
                                      : isWrongSelect
                                      ? 'bg-destructive text-white border-destructive'
                                      : 'bg-muted border-border text-muted-foreground'
                                  }`}
                                >
                                  {isSelected ? <Check className="h-3 w-3" /> : optIdx + 1}
                                </div>
                                <span>{option}</span>
                              </div>

                              <div className="shrink-0">
                                {isSelected && isTarget && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  >
                                    Your Correct Answer
                                  </Badge>
                                )}
                                {isWrongSelect && (
                                  <Badge variant="destructive" className="text-[10px]">
                                    Your Incorrect Choice
                                  </Badge>
                                )}
                                {isMissed && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                  >
                                    Correct Option (Missed)
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Drag-to-Order Breakdown Side-by-Side */}
                  {q.type === 'order' && (
                    <div className="space-y-3 pt-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Sequence Comparison
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* User Sequence */}
                        <div className="space-y-1.5 p-3.5 rounded-xl border border-border bg-background">
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mb-2">
                            <span>Your Submitted Order:</span>
                          </span>
                          {Array.isArray(userAnswer) && (userAnswer as string[]).length > 0 ? (
                            (userAnswer as string[]).map((item, i) => {
                              const isPlaceCorrect = item === q.correctOrder[i];
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                                    isPlaceCorrect
                                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-medium'
                                      : 'border-destructive/60 bg-destructive/10 text-destructive font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[11px]">{i + 1}.</span>
                                    <span>{item}</span>
                                  </div>
                                  {isPlaceCorrect ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <X className="h-3.5 w-3.5 text-destructive" />
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              No order submitted.
                            </p>
                          )}
                        </div>

                        {/* Correct Target Sequence */}
                        <div className="space-y-1.5 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                            <Check className="h-3.5 w-3.5" />
                            <span>Correct Target Order:</span>
                          </span>
                          {q.correctOrder.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 rounded-lg text-xs bg-background border border-emerald-500/20 text-foreground font-medium"
                            >
                              <span className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                                {i + 1}.
                              </span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Explanation Box */}
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-start gap-2.5 text-xs text-muted-foreground">
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 leading-relaxed">
                      <span className="font-bold text-foreground block">Explanation:</span>
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
