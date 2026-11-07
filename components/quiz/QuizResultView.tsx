'use client';

import Link from 'next/link';
import { Course, Quiz } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import { Award, CheckCircle2, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuizResultViewProps {
  course: Course;
  quiz: Quiz;
  attemptId: string;
}

export function QuizResultView({ course, quiz, attemptId }: QuizResultViewProps) {
  const isHydrated = useHydrated();
  const quizAttempts = useLearningStore((s) => s.quizAttempts);

  const attempt = isHydrated ? quizAttempts.find((a) => a.id === attemptId) : undefined;
  const isPassed = attempt ? attempt.scorePercent >= quiz.passingScorePercent : false;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
      <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-lg space-y-6">
        {/* Status Icon */}
        <div
          className={`h-20 w-20 mx-auto rounded-3xl flex items-center justify-center shadow-md ${
            isPassed
              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
              : 'bg-destructive/15 text-destructive border border-destructive/30'
          }`}
        >
          {isPassed ? (
            <Award className="h-10 w-10 stroke-[2.5]" />
          ) : (
            <XCircle className="h-10 w-10 stroke-[2.5]" />
          )}
        </div>

        {/* Title & Badge */}
        <div>
          <Badge
            variant={isPassed ? 'default' : 'destructive'}
            className="text-xs mb-3 font-semibold"
          >
            {isPassed ? 'Assessment Passed' : 'Assessment Failed'}
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {quiz.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Course: {course.title}
          </p>
        </div>

        {/* Score Display */}
        <div className="p-6 rounded-2xl bg-muted/50 border border-border max-w-sm mx-auto space-y-2">
          <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
            Your Final Score
          </span>
          <div className="text-5xl font-extrabold text-foreground tracking-tight">
            {attempt ? `${attempt.scorePercent}%` : '--%'}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
            <span>Passing grade: {quiz.passingScorePercent}%</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {quiz.questions.length} questions
            </span>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {isPassed
            ? 'Great job! You have demonstrated strong understanding of the architectural patterns and concepts covered in this module.'
            : 'You did not meet the passing score this time. Review the lesson materials and retake the quiz when you are ready.'}
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border">
          <Button asChild variant="outline" className="gap-2 text-xs font-semibold">
            <Link href={`/courses/${course.slug}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Link>
          </Button>

          <Button asChild className="gap-2 text-xs font-semibold shadow-xs">
            <Link href={`/courses/${course.slug}/quiz/${quiz.id}`}>
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
