'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Course, Quiz } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import { formatAttemptDuration, getMotivatingMessage } from '@/lib/results';
import { isCourseComplete } from '@/lib/certificate';
import { quizzes } from '@/data';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ScoreRing } from './ScoreRing';
import { ResultBreakdown } from './ResultBreakdown';
import { InsightsCard } from './InsightsCard';
import { AttemptHistory } from './AttemptHistory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Award,
  Sparkles,
  RotateCcw,
  RefreshCw,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trophy,
} from 'lucide-react';

interface QuizResultViewProps {
  course: Course;
  quiz: Quiz;
  attemptId: string;
}

export function QuizResultView({ course, quiz, attemptId }: QuizResultViewProps) {
  const router = useRouter();
  const isHydrated = useHydrated();
  const quizAttempts = useLearningStore((s) => s.quizAttempts);
  const enrolledCourseIds = useLearningStore((s) => s.enrolledCourseIds);
  const progress = useLearningStore((s) => s.progress);

  const [copied, setCopied] = useState(false);

  // Hydration skeleton
  if (!isHydrated) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded-md" />
        <div className="h-64 rounded-3xl bg-muted/60 border border-border" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-60 rounded-2xl bg-muted/40 border border-border" />
          <div className="h-60 rounded-2xl bg-muted/40 border border-border" />
        </div>
        <div className="h-96 rounded-2xl bg-muted/30 border border-border" />
      </div>
    );
  }

  const attempt = quizAttempts.find((a) => a.id === attemptId);

  // Attempt not found fallback
  if (!attempt) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Attempt Not Found</h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The requested assessment results could not be found or have expired from local storage.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild variant="outline" className="w-full sm:w-auto text-xs">
            <Link href={`/courses/${course.slug}`}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to Course
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto text-xs">
            <Link href={`/courses/${course.slug}/quiz/${quiz.id}`}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Take Quiz Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Attempt calculations
  const isPassed = attempt.scorePercent >= quiz.passingScorePercent;
  const attemptsForQuiz = quizAttempts
    .filter((a) => a.quizId === quiz.id)
    .sort((a, b) => new Date(a.finishedAt).getTime() - new Date(b.finishedAt).getTime());

  const currentAttemptIdx = attemptsForQuiz.findIndex((a) => a.id === attempt.id);
  const attemptNumber = currentAttemptIdx !== -1 ? currentAttemptIdx + 1 : 1;
  const totalAttemptsCount = Math.max(attemptsForQuiz.length, 1);

  // Check if this attempt is a new best score
  const priorAttempts = attemptsForQuiz.filter(
    (a) => new Date(a.finishedAt).getTime() < new Date(attempt.finishedAt).getTime()
  );
  const maxPriorScore = priorAttempts.length > 0
    ? Math.max(...priorAttempts.map((a) => a.scorePercent))
    : -1;
  const isNewBestScore = attempt.scorePercent > maxPriorScore;

  const correctCount = Object.values(attempt.perQuestionResult).filter(Boolean).length;
  const totalQuestionsCount = quiz.questions.length;
  const hasIncorrect = Object.values(attempt.perQuestionResult).some((v) => v === false);

  const durationFormatted = formatAttemptDuration(attempt.startedAt, attempt.finishedAt);
  let dateFormatted = 'Completed';
  try {
    dateFormatted = format(new Date(attempt.finishedAt), 'MMM d, yyyy · h:mm a');
  } catch {
    dateFormatted = 'Recently';
  }

  const motivatingMessage = getMotivatingMessage(attempt.scorePercent, quiz.passingScorePercent);

  // Course progress & certificate status
  const certStatus = isCourseComplete(course, enrolledCourseIds, progress, quizAttempts, quizzes);
  const remainingItemsCount = certStatus.remainingLessons.length + certStatus.unpassedQuizzes.length;

  // Retake handling: clear session storage
  const handleRetakeFull = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`glynac_quiz_session_${quiz.id}`);
      sessionStorage.removeItem(`glynac_quiz_session_${quiz.id}_retry`);
    }
    router.push(`/courses/${course.slug}/quiz/${quiz.id}`);
  };

  // Copy summary to clipboard
  const handleCopySummary = async () => {
    const summaryText = `Quiz: ${quiz.title}\nCourse: ${course.title}\nScore: ${attempt.scorePercent}% (${isPassed ? 'Passed' : 'Failed'})\nCorrect: ${correctCount}/${totalQuestionsCount}\nDate: ${dateFormatted}`;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  // Print results
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border print:hidden">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/courses" className="hover:text-foreground transition-colors">
            Courses
          </Link>
          <span>/</span>
          <Link href={`/courses/${course.slug}`} className="hover:text-foreground transition-colors">
            {course.title}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {quiz.title} Results
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="h-8 gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </Button>
        </div>
      </div>

      {/* Primary Result Banner / Header Card */}
      <div className="relative rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-lg overflow-hidden">
        {/* Subtle background glow */}
        <div
          className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isPassed ? 'bg-emerald-500' : 'bg-destructive'
          }`}
        />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          {/* Animated SVG Score Ring */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <ScoreRing
              scorePercent={attempt.scorePercent}
              isPassed={isPassed}
              size={170}
              strokeWidth={14}
            />

            {/* New Best Score celebration badge */}
            {isNewBestScore && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white gap-1 text-[11px] font-semibold shadow-xs">
                  <Sparkles className="h-3 w-3" />
                  New Best Score!
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Result Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge
                variant={isPassed ? 'default' : 'destructive'}
                className="text-xs font-semibold px-2.5 py-0.5"
              >
                {isPassed ? 'Assessment Passed' : 'Assessment Failed'}
              </Badge>

              <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                Attempt {attemptNumber} of {totalAttemptsCount}
              </Badge>

              {attempt.mode === 'retry-incorrect' && (
                <Badge variant="secondary" className="text-xs font-medium text-primary">
                  Retry Incorrect Mode
                </Badge>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {quiz.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Course: <span className="text-foreground font-medium">{course.title}</span>
              </p>
            </div>

            {/* Motivating message */}
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              {motivatingMessage}
            </p>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-muted/50 border border-border/80">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Accuracy
                </span>
                <span className="text-sm font-bold text-foreground mt-0.5 block">
                  {correctCount} / {totalQuestionsCount}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border border-border/80">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Award className="h-3 w-3 text-primary" />
                  Passing Mark
                </span>
                <span className="text-sm font-bold text-foreground mt-0.5 block">
                  {quiz.passingScorePercent}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border border-border/80">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  Time Taken
                </span>
                <span className="text-sm font-bold text-foreground mt-0.5 block">
                  {durationFormatted}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border border-border/80">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  Attempted
                </span>
                <span className="text-xs font-semibold text-foreground mt-1 block truncate">
                  {dateFormatted}
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-3 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetakeFull}
                className="gap-1.5 text-xs font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retake Full Quiz
              </Button>

              {hasIncorrect && (
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold text-primary"
                >
                  <Link
                    href={`/courses/${course.slug}/quiz/${quiz.id}?mode=retry-incorrect&from=${attempt.id}`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry Incorrect Questions
                  </Link>
                </Button>
              )}

              <Button asChild size="sm" className="gap-1.5 text-xs font-semibold shadow-xs">
                <Link href={`/courses/${course.slug}`}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Course
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Completion Banner / Certificate CTA */}
      {certStatus.isComplete ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Course Fully Completed!
              </h2>
              <p className="text-xs text-muted-foreground">
                Congratulations! You have completed all lessons and passed all curriculum assessments.
              </p>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Link href={`/courses/${course.slug}/certificate`}>
              <Award className="h-4 w-4" />
              Claim Certificate
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="h-11 w-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Course Certificate</h3>
              <p className="text-xs text-muted-foreground">
                Complete all lessons and assessments to unlock your verified credential ({remainingItemsCount} {remainingItemsCount === 1 ? 'item' : 'items'} remaining).
              </p>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5 text-xs font-semibold">
            <Link href={`/courses/${course.slug}/certificate`}>
              <Award className="h-3.5 w-3.5" />
              Get Certificate ({remainingItemsCount} left)
            </Link>
          </Button>
        </div>
      )}

      {/* Study Tips Card (if not passed) */}
      {!isPassed && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <HelpCircle className="h-4 w-4 text-primary" />
            Suggested Next Steps & Study Tips
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5">
            <li>
              Review the detailed explanations for each incorrect question in the breakdown below.
            </li>
            <li>
              Rewatch the recommended lessons highlighted in the Performance Insights panel.
            </li>
            <li>
              Use <strong>Retry Incorrect Questions</strong> to test yourself exclusively on the questions you missed.
            </li>
          </ul>
        </div>
      )}

      {/* Two-Column Analytics Grid: Insights & Attempt History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <InsightsCard
          course={course}
          quiz={quiz}
          perQuestionResult={attempt.perQuestionResult}
        />

        <AttemptHistory
          slug={course.slug}
          quizId={quiz.id}
          currentAttemptId={attempt.id}
          attempts={attemptsForQuiz}
          passingScore={quiz.passingScorePercent}
        />
      </div>

      {/* Detailed Question Breakdown */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">Question-by-Question Breakdown</h2>
          <p className="text-xs text-muted-foreground">
            Inspect correct answers, your submitted choices, and detailed explanations
          </p>
        </div>

        <ResultBreakdown
          quiz={quiz}
          answers={attempt.answers}
          perQuestionResult={attempt.perQuestionResult}
        />
      </div>
    </div>
  );
}
