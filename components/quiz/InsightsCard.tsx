'use client';

import Link from 'next/link';
import { Course, Quiz } from '@/types/learning';
import { getAccuracyByType, getReviewLessons } from '@/lib/results';
import { BarChart3, BookOpen, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface InsightsCardProps {
  course: Course;
  quiz: Quiz;
  perQuestionResult: Record<string, boolean>;
}

export function InsightsCard({ course, quiz, perQuestionResult }: InsightsCardProps) {
  const accuracyList = getAccuracyByType(quiz, perQuestionResult);
  const reviewLessons = getReviewLessons(course, quiz, perQuestionResult);
  const isPerfect = Object.values(perQuestionResult).length > 0 &&
    Object.values(perQuestionResult).every((val) => val === true);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Performance Insights</h2>
          <p className="text-xs text-muted-foreground">
            Analysis by question format and suggested revision
          </p>
        </div>
      </div>

      {/* Accuracy by Question Type */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <BarChart3 className="h-3.5 w-3.5" />
          Accuracy by Format
        </div>

        <div className="space-y-3.5">
          {accuracyList.map((acc) => (
            <div key={acc.type} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{acc.label}</span>
                <span className="font-semibold text-muted-foreground">
                  {acc.correct}/{acc.total} ({acc.percent}%)
                </span>
              </div>
              <Progress value={acc.percent} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Lessons */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" />
          Recommended Review
        </div>

        {isPerfect ? (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Flawless score! No lesson reviews required for this assessment.</span>
          </div>
        ) : reviewLessons.length > 0 ? (
          <div className="space-y-2">
            {reviewLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block truncate">
                    {lesson.sectionTitle}
                  </span>
                  <span className="text-xs font-semibold text-foreground truncate block">
                    {lesson.title}
                  </span>
                </div>
                <Button asChild size="sm" variant="ghost" className="shrink-0 h-8 gap-1 text-xs">
                  <Link href={`/courses/${course.slug}/learn/${lesson.id}`}>
                    Review
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No specific revision lessons needed.
          </p>
        )}
      </div>
    </div>
  );
}

