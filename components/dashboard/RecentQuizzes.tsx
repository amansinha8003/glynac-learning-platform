'use client';

import Link from 'next/link';
import { Course, Quiz, QuizAttempt } from '@/types/learning';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RecentQuizzesProps {
  attempts: QuizAttempt[];
  quizzes: Quiz[];
  courses: Course[];
}

export function RecentQuizzes({ attempts, quizzes, courses }: RecentQuizzesProps) {
  // Last 5 attempts sorted descending by completion timestamp
  const recentAttempts = [...attempts]
    .sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-foreground">Recent Quiz Results</h2>
          <p className="text-xs text-muted-foreground">Your latest module assessment scores</p>
        </div>

        <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">
          {attempts.length} {attempts.length === 1 ? 'assessment' : 'assessments'}
        </Badge>
      </div>

      {recentAttempts.length === 0 ? (
        <div className="p-8 text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">No Assessments Completed Yet</h3>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto mt-0.5">
              Complete quizzes inside lessons to evaluate your retention and track your mastery here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentAttempts.map((attempt) => {
            const quiz = quizzes.find((q) => q.id === attempt.quizId);
            const course = courses.find((c) => c.id === attempt.courseId);
            const passingScore = quiz?.passingScorePercent ?? 70;
            const isPassed = attempt.scorePercent >= passingScore;

            let formattedDate = 'Completed';
            try {
              formattedDate = format(new Date(attempt.finishedAt), 'MMM d, h:mm a');
            } catch {
              formattedDate = 'Recently';
            }

            const resultUrl = course && quiz
              ? `/courses/${course.slug}/quiz/${quiz.id}/result/${attempt.id}`
              : '#';

            return (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isPassed
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate">
                      {quiz?.title ?? 'Assessment'}
                    </h3>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {course?.title ?? 'Course'} • {formattedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-foreground font-mono tabular-nums block">
                      {attempt.scorePercent}%
                    </span>
                    <span
                      className={`text-[10px] font-semibold block ${
                        isPassed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-destructive'
                      }`}
                    >
                      {isPassed ? 'Passed' : 'Failed'}
                    </span>
                  </div>

                  <Button asChild size="icon" variant="ghost" className="h-7 w-7 rounded-lg">
                    <Link href={resultUrl} aria-label="View quiz result breakdown">
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
