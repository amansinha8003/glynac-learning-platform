'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Course, Section, Lesson } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import { VideoPlayer, VideoPlayerRef } from '@/components/player/VideoPlayer';
import { CourseSidebar } from './CourseSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  FileText,
  StickyNote,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface LessonClientViewProps {
  course: Course;
  section: Section;
  lesson: Lesson;
  prevLesson?: Lesson;
  nextLesson?: Lesson;
}

export function LessonClientView({
  course,
  section,
  lesson,
  prevLesson,
  nextLesson,
}: LessonClientViewProps) {
  const isHydrated = useHydrated();
  const playerRef = useRef<VideoPlayerRef>(null);
  const markLessonComplete = useLearningStore((s) => s.markLessonComplete);
  const recordActivity = useLearningStore((s) => s.recordActivity);
  const progress = useLearningStore((s) => s.progress);

  const isCompleted = isHydrated && !!progress.lessons[lesson.id]?.completed;
  const [activeTab, setActiveTab] = useState('transcript');

  const toggleComplete = () => {
    markLessonComplete(course.id, lesson.id, !isCompleted);
    recordActivity();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-4 mb-5 text-xs text-muted-foreground">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to {course.title}</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {section.title}
          </Badge>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column (Player + Controls + Tabs) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Custom Video Player */}
          <VideoPlayer
            ref={playerRef}
            courseId={course.id}
            courseSlug={course.slug}
            lesson={lesson}
            nextLesson={nextLesson}
          />

          {/* Lesson Header & Action Controls */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-xs uppercase tracking-wider font-bold text-primary">
                {section.title}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mt-0.5">
                {lesson.title}
              </h1>
            </div>

            {/* Complete Toggle & Nav Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mark as Complete Toggle */}
              <Button
                variant={isCompleted ? 'secondary' : 'outline'}
                size="sm"
                onClick={toggleComplete}
                className="gap-1.5 text-xs font-semibold"
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <span>Mark Complete</span>
                  </>
                )}
              </Button>

              {/* Prev Lesson Button */}
              {prevLesson ? (
                <Button asChild variant="outline" size="sm" className="h-9 px-2.5">
                  <Link
                    href={`/courses/${course.slug}/learn/${prevLesson.id}`}
                    aria-label={`Previous lesson: ${prevLesson.title}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled className="h-9 px-2.5 opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}

              {/* Next Lesson Button */}
              {nextLesson ? (
                <Button asChild size="sm" className="h-9 px-3 font-semibold gap-1">
                  <Link
                    href={`/courses/${course.slug}/learn/${nextLesson.id}`}
                    aria-label={`Next lesson: ${nextLesson.title}`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="sm" disabled className="h-9 px-3 opacity-40">
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Tabs Area Below Player (Transcript, Notes Placeholder) */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList variant="line" className="w-full justify-start border-b border-border/80 h-10 p-0 gap-6">
                <TabsTrigger
                  value="transcript"
                  className="text-xs sm:text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-2.5 gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Transcript ({lesson.transcript.length} cues)</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="text-xs sm:text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-2.5 gap-1.5"
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  <span>Notes & Bookmarks</span>
                </TabsTrigger>
              </TabsList>

              {/* Transcript Tab Placeholder */}
              <TabsContent value="transcript" className="pt-5">
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-3">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Interactive Transcript Active</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Captions are loaded and synchronized with the video player. Interactive real-time seeking and auto-scroll highlighting will be connected in the next step.
                  </p>
                </div>
              </TabsContent>

              {/* Notes Tab Placeholder */}
              <TabsContent value="notes" className="pt-5">
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-3">
                    <StickyNote className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Timestamped Notes</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Create personal notes tied to specific video moments. The full interactive notes manager will be activated in the next step.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Column (Course Content Sidebar) */}
        <div className="lg:col-span-4 w-full">
          <CourseSidebar course={course} currentLessonId={lesson.id} />
        </div>
      </div>
    </div>
  );
}

