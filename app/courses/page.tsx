'use client';

import { courses, instructors } from '@/data';
import { useLearningStore } from '@/store/learningStore';
import { getCourseProgressPercent } from '@/lib/selectors';
import { useHydrated } from '@/lib/useHydrated';
import { Clock, BookOpen, Star, CheckCircle2 } from 'lucide-react';

export default function CoursesPage() {
  const isHydrated = useHydrated();
  const enrolledCourseIds = useLearningStore((s) => s.enrolledCourseIds);
  const progress = useLearningStore((s) => s.progress);
  const enrollCourse = useLearningStore((s) => s.enrollCourse);

  const instructorMap = new Map(instructors.map((i) => [i.id, i]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Explore Courses
        </h1>
        <p className="mt-2 text-muted-foreground text-base max-w-2xl">
          Discover {courses.length} production-grade masterclasses across Web Development, Data Science, Design, and Business.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const instructor = instructorMap.get(course.instructorId);
          const isEnrolled = isHydrated && enrolledCourseIds.includes(course.id);
          const progressPercent = isHydrated ? getCourseProgressPercent(course, progress) : 0;
          const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);

          return (
            <div
              key={course.id}
              className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/40"
            >
              {/* Thumbnail (CSS Gradient + Emoji, no external images) */}
              <div
                className={`h-40 w-full bg-gradient-to-br ${course.thumbnail.gradient} flex items-center justify-center relative p-6 select-none`}
              >
                <span className="text-6xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">
                  {course.thumbnail.emoji}
                </span>

                {/* Level badge */}
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20">
                  {course.level}
                </div>

                {/* Category tag */}
                <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/20">
                  {course.category}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-5">
                {/* Rating & stats */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {course.rating}
                  </span>
                  <span>({course.ratingsCount.toLocaleString()} reviews)</span>
                  <span className="ml-auto flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {Math.round(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-bold text-lg leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                  {course.title}
                </h2>

                {/* Description */}
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
                  {course.description}
                </p>

                {/* Instructor */}
                {instructor && (
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Instructor: <strong className="text-foreground">{instructor.name}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      {totalLessons} lessons
                    </span>
                  </div>
                )}

                {/* Progress bar if enrolled */}
                {isEnrolled && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Enrolled
                      </span>
                      <span>{progressPercent}% complete</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action button */}
                <div className="mt-4 pt-2">
                  {isEnrolled ? (
                    <button
                      type="button"
                      className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Continue Course
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => enrollCourse(course.id)}
                      className="w-full py-2 px-4 rounded-lg border border-primary/50 text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Enroll Free
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
