'use client';

import Link from 'next/link';
import { Course, Instructor } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { getCourseProgressPercent } from '@/lib/selectors';
import { useHydrated } from '@/lib/useHydrated';
import { Clock, Star, PlayCircle, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
  course: Course;
  instructor?: Instructor;
  searchQuery?: string;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function HighlightedText({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim()) return <>{text}</>;
  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-300/40 text-amber-950 dark:bg-amber-400/30 dark:text-amber-200 rounded-xs px-0.5 font-bold"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function CourseCard({ course, instructor, searchQuery }: CourseCardProps) {
  const isHydrated = useHydrated();
  const enrolledCourseIds = useLearningStore((s) => s.enrolledCourseIds);
  const progress = useLearningStore((s) => s.progress);

  const isEnrolled = isHydrated && enrolledCourseIds.includes(course.id);
  const progressPercent = isEnrolled ? getCourseProgressPercent(course, progress) : 0;
  const isCompleted = progressPercent === 100;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Thumbnail (CSS Gradient + Emoji) */}
      <div
        className={`h-44 w-full bg-gradient-to-br ${course.thumbnail.gradient} flex items-center justify-center relative p-6 select-none overflow-hidden`}
      >
        <span className="text-6xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">
          {course.thumbnail.emoji}
        </span>

        {/* Level Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className="bg-black/50 backdrop-blur-md text-white border-white/20 text-[11px] font-semibold"
          >
            {course.level}
          </Badge>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge
            variant="secondary"
            className="bg-black/50 backdrop-blur-md text-white border-white/10 text-[11px] font-medium"
          >
            {course.category}
          </Badge>
        </div>

        {/* In-progress / Continue Overlay Pill */}
        {isEnrolled && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md">
            <PlayCircle className="h-3.5 w-3.5" />
            <span>{isCompleted ? 'Completed' : 'Continue'}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Rating & Duration Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">{course.rating.toFixed(2)}</span>
            <span>({course.ratingsCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDuration(course.durationMinutes)}</span>
          </div>
        </div>

        {/* Title (max 2 lines) */}
        <h3 className="font-bold text-base leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          <HighlightedText text={course.title} query={searchQuery} />
        </h3>

        {/* Instructor */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span>{instructor ? instructor.name : 'Lead Faculty'}</span>
        </div>

        {/* Progress Bar (if enrolled) */}
        <div className="mt-auto pt-4">
          {isEnrolled ? (
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-medium text-foreground">
                  {isCompleted ? 'Finished Course' : 'Progress'}
                </span>
                <span className="font-semibold text-primary">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground border-t border-border/40">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                {course.sections.length} sections • {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons
              </span>
              <span className="font-semibold text-primary group-hover:underline">View Course &rarr;</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

