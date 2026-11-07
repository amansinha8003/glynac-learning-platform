'use client';

import Link from 'next/link';
import { Course, ProgressState } from '@/types/learning';
import { getCourseProgressPercent } from '@/lib/selectors';
import { ProgressRing } from './ProgressRing';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourseRingsGridProps {
  courses: Course[];
  progress: ProgressState;
}

export function CourseRingsGrid({ courses, progress }: CourseRingsGridProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center space-y-3">
        <div className="h-10 w-10 mx-auto rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center">
          <BookOpen className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold text-foreground">No Enrolled Courses</p>
        <p className="text-[11px] text-muted-foreground">
          Enroll in any course to track your module completion percentage here.
        </p>
        <Button asChild size="sm" variant="outline" className="text-xs">
          <Link href="/courses">Browse Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-foreground">Course Completion</h2>
          <p className="text-xs text-muted-foreground">Detailed syllabus progress across enrolled subjects</p>
        </div>

        <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">
          {courses.length} {courses.length === 1 ? 'course' : 'courses'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {courses.map((course) => {
          const percent = getCourseProgressPercent(course, progress);
          const isCompleted = percent === 100 || !!progress.courses[course.id]?.completedAt;
          const isStarted = percent > 0;

          return (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 transition-all flex flex-col items-center text-center gap-3 group"
            >
              <ProgressRing
                value={percent}
                size={76}
                stroke={7}
                label={course.title}
                colorClassName={
                  isCompleted
                    ? 'text-emerald-500 stroke-current'
                    : 'text-primary stroke-current'
                }
              />

              <div className="space-y-1.5 w-full">
                <h3 className="font-bold text-xs text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {course.title}
                </h3>

                <div>
                  {isCompleted ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 border-none text-[10px] py-0 px-2 h-4 font-semibold">
                      Completed
                    </Badge>
                  ) : isStarted ? (
                    <Badge className="bg-primary-soft text-primary hover:bg-primary-soft/80 border-none text-[10px] py-0 px-2 h-4 font-semibold">
                      In Progress
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] py-0 px-2 h-4 font-medium text-muted-foreground">
                      Not Started
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
