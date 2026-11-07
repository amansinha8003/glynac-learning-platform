'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Course } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { getCourseProgressPercent } from '@/lib/selectors';
import { useHydrated } from '@/lib/useHydrated';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  PlayCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Video,
  FileText,
  Award,
  Infinity,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface CourseSummaryCardProps {
  course: Course;
  targetLessonId: string;
  onEnroll: () => void;
  justEnrolled: boolean;
}

export function CourseSummaryCard({
  course,
  targetLessonId,
  onEnroll,
  justEnrolled,
}: CourseSummaryCardProps) {
  const isHydrated = useHydrated();
  const enrolledCourseIds = useLearningStore((s) => s.enrolledCourseIds);
  const progress = useLearningStore((s) => s.progress);

  const isEnrolled = isHydrated && enrolledCourseIds.includes(course.id);
  const progressPercent = isEnrolled ? getCourseProgressPercent(course, progress) : 0;
  const isCompleted = progressPercent === 100;
  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-lg overflow-hidden relative">
      {/* Thumbnail Header */}
      <div
        className={`h-40 w-full rounded-2xl bg-gradient-to-br ${course.thumbnail.gradient} flex items-center justify-center relative p-6 mb-6 select-none shadow-inner`}
      >
        <span className="text-6xl drop-shadow-md">{course.thumbnail.emoji}</span>
      </div>

      {/* CTA Button and Enrollment States */}
      <div className="space-y-4 mb-6">
        {!isHydrated ? (
          <div className="h-11 w-full bg-muted animate-pulse rounded-xl" />
        ) : justEnrolled ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            <span>Enrolled! Happy Learning</span>
          </motion.div>
        ) : !isEnrolled ? (
          <Button
            type="button"
            onClick={onEnroll}
            size="lg"
            className="w-full h-11 text-sm font-semibold shadow-md gap-2"
          >
            <span>Enroll for Free</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : isCompleted ? (
          <Button asChild size="lg" variant="outline" className="w-full h-11 text-sm font-semibold gap-2">
            <Link href={`/courses/${course.slug}/learn/${targetLessonId}`}>
              <RotateCcw className="h-4 w-4" />
              <span>Review Course</span>
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="w-full h-11 text-sm font-semibold shadow-md gap-2">
            <Link href={`/courses/${course.slug}/learn/${targetLessonId}`}>
              <PlayCircle className="h-4 w-4" />
              <span>Continue Learning</span>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Link>
          </Button>
        )}

        {/* Progress Display (if enrolled) */}
        <AnimatePresence>
          {isHydrated && isEnrolled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-1"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {isCompleted ? 'Course Completed' : 'Your Progress'}
                </span>
                <span className="font-bold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feature Guarantee List */}
      <div className="border-t border-border/60 pt-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          This course includes:
        </h4>

        <ul className="space-y-2.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2.5">
            <Video className="h-4 w-4 text-primary shrink-0" />
            <span>
              {Math.round(course.durationMinutes / 60)} hours of on-demand HD video
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span>{totalLessons} lessons with interactive synchronized transcripts</span>
          </li>
          <li className="flex items-center gap-2.5">
            <HelpCircle className="h-4 w-4 text-primary shrink-0" />
            <span>Interactive quizzes, checkpoints & order challenges</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Award className="h-4 w-4 text-primary shrink-0" />
            <span>Verified Certificate of Completion upon finishing</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Infinity className="h-4 w-4 text-primary shrink-0" />
            <span>Full lifetime access on desktop and mobile</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

