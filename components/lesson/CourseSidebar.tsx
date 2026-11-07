'use client';

import Link from 'next/link';
import { Course } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import { getCourseProgressPercent } from '@/lib/selectors';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, PlayCircle, HelpCircle } from 'lucide-react';
import { formatVideoTime } from '@/components/player/SeekBar';

interface CourseSidebarProps {
  course: Course;
  currentLessonId: string;
}

export function CourseSidebar({ course, currentLessonId }: CourseSidebarProps) {
  const isHydrated = useHydrated();
  const progress = useLearningStore((s) => s.progress);
  const progressPercent = isHydrated ? getCourseProgressPercent(course, progress) : 0;
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const completedCount = isHydrated
    ? allLessons.filter((l) => progress.lessons[l.id]?.completed).length
    : 0;

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* Header and Progress */}
      <div className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span className="font-bold text-foreground">Course Content</span>
          <span className="font-semibold text-primary">
            {completedCount}/{allLessons.length} completed
          </span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      {/* Sections and Lessons List */}
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {course.sections.map((section, sIdx) => {
          return (
            <div key={section.id} className="space-y-1.5">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>
                  Section {sIdx + 1}: {section.title}
                </span>
                <span>{section.lessons.length}</span>
              </div>

              <div className="space-y-1">
                {section.lessons.map((l) => {
                  const isActive = l.id === currentLessonId;
                  const isCompleted = isHydrated && !!progress.lessons[l.id]?.completed;

                  return (
                    <Link
                      key={l.id}
                      href={`/courses/${course.slug}/learn/${l.id}`}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors border ${
                        isActive
                          ? 'bg-primary/10 text-primary border-primary/30 font-semibold shadow-xs'
                          : 'bg-background hover:bg-muted text-foreground border-transparent hover:border-border/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
                        ) : isActive ? (
                          <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        )}

                        <span className="truncate leading-tight">{l.title}</span>

                        {l.quizId && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 font-semibold text-amber-600 border-amber-500/30 bg-amber-500/10 shrink-0 gap-0.5"
                          >
                            <HelpCircle className="h-2 w-2" />
                            Quiz
                          </Badge>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-muted-foreground shrink-0 pl-1">
                        {formatVideoTime(l.durationSeconds)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

