'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Course, Lesson } from '@/types/learning';
import { ChevronLeft, ChevronRight, Play, BookOpen, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export interface InProgressCourseItem {
  course: Course;
  nextLesson: Lesson;
  percent: number;
  completedCount: number;
  totalCount: number;
}

interface ContinueCarouselProps {
  items: InProgressCourseItem[];
}

export function ContinueCarousel({ items }: ContinueCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-primary-soft text-2xl flex items-center justify-center shadow-xs">
          🚀
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">No Courses in Progress</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t started any courses yet. Explore our curriculum to begin learning today!
          </p>
        </div>
        <Button asChild size="sm" className="gap-2 text-xs font-semibold shadow-xs">
          <Link href="/courses">
            <Compass className="h-3.5 w-3.5" />
            Browse Courses
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Arrow Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Continue Learning</h2>
          <p className="text-xs text-muted-foreground">Pick up right where you left off</p>
        </div>

        {items.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScroll('left')}
              className="h-8 w-8 rounded-xl border-border bg-card hover:bg-muted"
              aria-label="Previous course"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScroll('right')}
              className="h-8 w-8 rounded-xl border-border bg-card hover:bg-muted"
              aria-label="Next course"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Snap-scrollable Card Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-hidden"
        tabIndex={0}
        aria-label="In-progress courses carousel"
      >
        {items.map(({ course, nextLesson, percent, completedCount, totalCount }) => (
          <div
            key={course.id}
            className="w-[280px] sm:w-[320px] shrink-0 snap-start rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div className="space-y-3">
              {/* Thumbnail banner & Category */}
              <div
                className={`h-24 rounded-xl flex items-center justify-between px-4 text-white relative overflow-hidden bg-gradient-to-r ${course.thumbnail.gradient}`}
              >
                <Badge
                  variant="secondary"
                  className="bg-black/30 backdrop-blur-md text-white border-none text-[10px] font-semibold"
                >
                  {course.category}
                </Badge>
                <span className="text-3xl select-none">{course.thumbnail.emoji}</span>
              </div>

              {/* Title & Next Lesson */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {course.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                  <BookOpen className="h-3 w-3 shrink-0 text-primary" />
                  <span className="truncate">Next: {nextLesson.title}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar & CTA */}
            <div className="pt-4 border-t border-border mt-3 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>{percent}% completed</span>
                  <span className="tabular-nums">
                    {completedCount}/{totalCount} lessons
                  </span>
                </div>
                <Progress value={percent} className="h-1.5" />
              </div>

              <Button
                asChild
                size="sm"
                className="w-full h-8 gap-1.5 text-xs font-semibold shadow-xs"
              >
                <Link href={`/courses/${course.slug}/learn/${nextLesson.id}`}>
                  <Play className="h-3 w-3 fill-current" />
                  Resume Lesson
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

