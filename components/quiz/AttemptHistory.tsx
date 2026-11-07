'use client';

import Link from 'next/link';
import { QuizAttempt } from '@/types/learning';
import { format } from 'date-fns';
import { History, TrendingUp, TrendingDown, Minus, CheckCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AttemptHistoryProps {
  slug: string;
  quizId: string;
  currentAttemptId: string;
  attempts: QuizAttempt[];
  passingScore: number;
}

export function AttemptHistory({
  slug,
  quizId,
  currentAttemptId,
  attempts,
  passingScore,
}: AttemptHistoryProps) {
  // Sort attempts chronologically ascending to calculate progression & chart
  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(a.finishedAt).getTime() - new Date(b.finishedAt).getTime()
  );

  if (sortedAttempts.length === 0) return null;

  // Mini Chart Calculations
  const chartHeight = 60;
  const chartWidth = 240;
  const paddingX = 16;
  const paddingY = 10;

  const points = sortedAttempts.map((attempt, idx) => {
    const x =
      sortedAttempts.length === 1
        ? chartWidth / 2
        : paddingX + (idx / (sortedAttempts.length - 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight - paddingY - (attempt.scorePercent / 100) * (chartHeight - paddingY * 2);
    return { x, y, score: attempt.scorePercent, id: attempt.id };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Attempt History</h2>
            <p className="text-xs text-muted-foreground">
              {sortedAttempts.length} {sortedAttempts.length === 1 ? 'attempt' : 'attempts'} recorded
            </p>
          </div>
        </div>

        {/* Passing threshold indicator */}
        <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">
          Pass Mark: {passingScore}%
        </Badge>
      </div>

      {/* SVG Score Progression Chart (if 2+ attempts) */}
      {sortedAttempts.length > 1 && (
        <div className="p-3 rounded-xl bg-muted/40 border border-border/80">
          <div className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center justify-between">
            <span>Score Trend</span>
            <span className="text-[10px]">Recent &rarr;</span>
          </div>
          <div className="w-full flex justify-center overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full max-w-[280px] h-16 overflow-visible"
              aria-label="Score trend across attempts"
            >
              {/* Pass baseline */}
              <line
                x1={paddingX}
                y1={chartHeight - paddingY - (passingScore / 100) * (chartHeight - paddingY * 2)}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY - (passingScore / 100) * (chartHeight - paddingY * 2)}
                stroke="currentColor"
                strokeDasharray="3 3"
                className="text-border stroke-[1.5]"
              />

              {/* Connecting line */}
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
                className="text-primary"
              />

              {/* Data points */}
              {points.map((p) => {
                const isSelected = p.id === currentAttemptId;
                return (
                  <g key={p.id}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 5.5 : 4}
                      className={
                        isSelected
                          ? 'fill-primary stroke-background stroke-2'
                          : 'fill-muted-foreground/80'
                      }
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* List of attempts (reversed to show latest first) */}
      <div className="space-y-2.5">
        {[...sortedAttempts].reverse().map((att, rIdx) => {
          const attemptIndex = sortedAttempts.length - rIdx;
          const isCurrent = att.id === currentAttemptId;
          const isPassed = att.scorePercent >= passingScore;

          // Compute delta vs previous attempt in chronological sequence
          const origIdx = sortedAttempts.findIndex((a) => a.id === att.id);
          const prevAttempt = origIdx > 0 ? sortedAttempts[origIdx - 1] : null;
          const delta = prevAttempt ? att.scorePercent - prevAttempt.scorePercent : null;

          let formattedDate = '';
          try {
            formattedDate = format(new Date(att.finishedAt), 'MMM d, h:mm a');
          } catch {
            formattedDate = 'Completed';
          }

          return (
            <div
              key={att.id}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                isCurrent
                  ? 'border-primary/50 bg-primary/5 shadow-xs'
                  : 'border-border bg-card hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    isPassed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-destructive/15 text-destructive'
                  }`}
                >
                  #{attemptIndex}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-foreground">
                      {att.scorePercent}%
                    </span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                        Current
                      </Badge>
                    )}
                    {att.mode === 'retry-incorrect' && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 text-muted-foreground">
                        Retry
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {formattedDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Delta Badge */}
                {delta !== null && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                      delta > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : delta < 0
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {delta > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : delta < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    {delta > 0 ? `+${delta}%` : `${delta}%`}
                  </span>
                )}

                {/* View Result Link if not current */}
                {!isCurrent ? (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Link href={`/courses/${slug}/quiz/${quizId}/result/${att.id}`}>
                      View
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
