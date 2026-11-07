'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Course } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  HelpCircle,
  ChevronsUpDown,
} from 'lucide-react';

interface SyllabusAccordionProps {
  course: Course;
}

function formatLessonTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSectionDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function SyllabusAccordion({ course }: SyllabusAccordionProps) {
  const isHydrated = useHydrated();
  const progress = useLearningStore((s) => s.progress);
  const lastLessonId = isHydrated ? progress.courses[course.id]?.lastLessonId : undefined;

  // Determine first incomplete section
  const initialOpen = (() => {
    if (!isHydrated) return course.sections[0] ? [course.sections[0].id] : [];
    const firstIncomplete = course.sections.find((sec) => {
      const completed = sec.lessons.filter((l) => progress.lessons[l.id]?.completed).length;
      return completed < sec.lessons.length;
    });
    return [firstIncomplete ? firstIncomplete.id : course.sections[0]?.id || ''];
  })();

  const [openSections, setOpenSections] = useState<string[]>(initialOpen);

  const allSectionIds = course.sections.map((s) => s.id);
  const isAllExpanded =
    allSectionIds.length > 0 &&
    allSectionIds.every((id) => openSections.includes(id));

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setOpenSections([]);
    } else {
      setOpenSections(allSectionIds);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Meta & Expand All Control */}
      <div className="flex items-center justify-between py-1 text-xs text-muted-foreground border-b border-border/60 pb-3">
        <span>
          {course.sections.length} sections •{' '}
          {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} total lessons
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleExpandAll}
          className="h-8 px-2 text-xs text-primary font-medium hover:text-primary gap-1"
        >
          <ChevronsUpDown className="h-3.5 w-3.5" />
          {isAllExpanded ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>

      {/* Accordion Component */}
      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSections}
        className="w-full space-y-3"
      >
        {course.sections.map((section, idx) => {
          const sectionDurationSec = section.lessons.reduce(
            (acc, l) => acc + l.durationSeconds,
            0
          );
          const completedCount = isHydrated
            ? section.lessons.filter((l) => progress.lessons[l.id]?.completed).length
            : 0;

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="rounded-xl border border-border bg-card px-4 py-1 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 text-left gap-1 sm:gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-muted-foreground w-5">
                      {idx + 1}.
                    </span>
                    <span className="font-semibold text-sm sm:text-base text-foreground">
                      {section.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 pl-7 sm:pl-0">
                    {isHydrated && completedCount > 0 && (
                      <span className="font-medium text-primary">
                        {completedCount}/{section.lessons.length} completed
                      </span>
                    )}
                    <span>{section.lessons.length} lessons</span>
                    <span>•</span>
                    <span>{formatSectionDuration(sectionDurationSec)}</span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-1 pb-3">
                <ul className="divide-y divide-border/50 border-t border-border/50 -mx-4 px-4 mt-1">
                  {section.lessons.map((lesson) => {
                    const isCompleted = isHydrated && !!progress.lessons[lesson.id]?.completed;
                    const isCurrent = isHydrated && lastLessonId === lesson.id;

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/courses/${course.slug}/learn/${lesson.id}`}
                          className="flex items-center justify-between py-2.5 px-3 rounded-lg text-xs sm:text-sm hover:bg-muted/60 transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {/* State Icon */}
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
                            ) : isCurrent ? (
                              <PlayCircle className="h-4 w-4 text-primary shrink-0 animate-pulse" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground/60 shrink-0 group-hover:text-foreground" />
                            )}

                            {/* Lesson Title */}
                            <span
                              className={`truncate font-medium transition-colors ${
                                isCompleted
                                  ? 'text-muted-foreground line-through decoration-muted-foreground/40'
                                  : isCurrent
                                  ? 'text-primary font-semibold'
                                  : 'text-foreground group-hover:text-primary'
                              }`}
                            >
                              {lesson.title}
                            </span>

                            {/* Quiz Badge */}
                            {lesson.quizId && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 font-semibold text-amber-600 border-amber-500/30 dark:text-amber-400 bg-amber-500/10 shrink-0 gap-1"
                              >
                                <HelpCircle className="h-2.5 w-2.5" />
                                Quiz
                              </Badge>
                            )}
                          </div>

                          {/* Duration */}
                          <span className="text-xs text-muted-foreground font-mono shrink-0 pl-2">
                            {formatLessonTime(lesson.durationSeconds)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

