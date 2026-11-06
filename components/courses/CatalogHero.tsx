'use client';

import Link from 'next/link';
import { courses } from '@/data';
import { useLearningStore } from '@/store/learningStore';
import { getContinueLearning } from '@/lib/selectors';
import { useHydrated } from '@/lib/useHydrated';
import { PlayCircle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CatalogHero() {
  const isHydrated = useHydrated();
  const enrolledCourseIds = useLearningStore((s) => s.enrolledCourseIds);
  const progress = useLearningStore((s) => s.progress);

  const continueItem = isHydrated
    ? getContinueLearning(courses, enrolledCourseIds, progress)
    : null;

  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card via-card/90 to-background p-6 sm:p-8 lg:p-10 shadow-sm">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Left: Heading & Intro */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Professional Curriculum</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Master In-Demand <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              Modern Tech Skills
            </span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Production-grade courses designed for engineers and designers. Complete interactive quizzes, track progress, and build deep expertise.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <BookOpen className="h-4 w-4 text-primary" />
              12 Comprehensive Courses
            </span>
            <span>•</span>
            <span>4 Domain Categories</span>
            <span>•</span>
            <span>Interactive Quizzes & Transcripts</span>
          </div>
        </div>

        {/* Right: Continue Learning Shortcut (if in-progress course exists) */}
        {continueItem && (
          <div className="w-full lg:w-96 shrink-0 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 backdrop-blur-sm transition-all hover:border-primary/50 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4" />
                Resume Learning
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {continueItem.progressPercent}% complete
              </span>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <div
                className={`h-12 w-12 rounded-xl bg-gradient-to-br ${continueItem.course.thumbnail.gradient} flex items-center justify-center shrink-0 shadow-xs`}
              >
                <span className="text-2xl">{continueItem.course.thumbnail.emoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-foreground truncate">
                  {continueItem.course.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  Lesson: {continueItem.lesson.title}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mb-3.5">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${continueItem.progressPercent}%` }}
              />
            </div>

            <Button asChild size="sm" className="w-full font-semibold gap-1.5 shadow-sm">
              <Link href={`/courses/${continueItem.course.slug}`}>
                Continue Lesson
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

