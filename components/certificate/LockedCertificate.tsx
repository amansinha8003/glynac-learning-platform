'use client';

import Link from 'next/link';
import { Course } from '@/types/learning';
import { CourseCompletionStatus } from '@/lib/certificate';
import {
  Lock,
  ArrowLeft,
  Play,
  HelpCircle,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface LockedCertificateProps {
  course: Course;
  status: CourseCompletionStatus;
}

export function LockedCertificate({ course, status }: LockedCertificateProps) {
  // If not enrolled
  if (!status.isEnrolled) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-primary-soft text-primary flex items-center justify-center shadow-xs">
          <GraduationCap className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Enroll to Unlock Certificate
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            You must be enrolled in <strong className="text-foreground">{course.title}</strong> and complete all curriculum lessons and assessments to earn your official verified certificate.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild size="lg" className="text-xs font-bold gap-2">
            <Link href={`/courses/${course.slug}`}>
              <ArrowLeft className="h-4 w-4" />
              Enroll on Course Page
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Next item to continue learning
  const nextTargetUrl =
    status.remainingLessons.length > 0
      ? `/courses/${course.slug}/learn/${status.remainingLessons[0].id}`
      : status.unpassedQuizzes.length > 0
      ? `/courses/${course.slug}/quiz/${status.unpassedQuizzes[0].id}`
      : `/courses/${course.slug}`;

  const progressPercent = Math.round(
    ((status.completedLessonsCount + status.passedQuizzesCount) /
      (status.totalLessonsCount + status.totalQuizzesCount)) *
      100
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Locked Header Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-1.5">
          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">
            Requirements Incomplete
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Certificate Locked
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            To earn the official completion certificate for <strong className="text-foreground">{course.title}</strong>, you must complete every lesson and pass all curriculum assessments.
          </p>
        </div>

        {/* Progress bar */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground">Course Completion</span>
            <span className="text-primary font-bold font-mono">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>
              {status.completedLessonsCount} of {status.totalLessonsCount} lessons complete
            </span>
            <span>
              {status.passedQuizzesCount} of {status.totalQuizzesCount} quizzes passed
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs font-semibold">
            <Link href={`/courses/${course.slug}`}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Course Syllabus
            </Link>
          </Button>
          <Button asChild size="sm" className="w-full sm:w-auto text-xs font-bold gap-1.5">
            <Link href={nextTargetUrl}>
              <Play className="h-3.5 w-3.5 fill-current" />
              Continue Learning
            </Link>
          </Button>
        </div>
      </div>

      {/* Outstanding Checklist */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold text-foreground">Outstanding Requirements to Complete</h2>
        </div>

        {/* Remaining Lessons */}
        {status.remainingLessons.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-muted-foreground block">
              Remaining Lessons ({status.remainingLessons.length})
            </span>
            <div className="space-y-1.5">
              {status.remainingLessons.slice(0, 5).map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-medium text-foreground truncate">{lesson.title}</span>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-primary shrink-0">
                    <Link href={`/courses/${course.slug}/learn/${lesson.id}`}>
                      Start Lesson &rarr;
                    </Link>
                  </Button>
                </div>
              ))}
              {status.remainingLessons.length > 5 && (
                <p className="text-[11px] text-muted-foreground italic pl-1">
                  ...and {status.remainingLessons.length - 5} more lessons
                </p>
              )}
            </div>
          </div>
        )}

        {/* Unpassed Quizzes */}
        {status.unpassedQuizzes.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] uppercase font-bold text-muted-foreground block">
              Required Assessments to Pass ({status.unpassedQuizzes.length})
            </span>
            <div className="space-y-1.5">
              {status.unpassedQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">{quiz.title}</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 shrink-0">
                      Pass mark: {quiz.passingScorePercent}%
                    </Badge>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-primary shrink-0">
                    <Link href={`/courses/${course.slug}/quiz/${quiz.id}`}>
                      Take Quiz &rarr;
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
