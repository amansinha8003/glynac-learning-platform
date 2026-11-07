'use client';

import { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Course, Section, Lesson } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import { VideoPlayer, VideoPlayerRef } from '@/components/player/VideoPlayer';
import { CourseSidebar } from './CourseSidebar';
import { TranscriptPanel } from './TranscriptPanel';
import { NotesPanel } from './NotesPanel';
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
  ArrowLeft,
} from 'lucide-react';

interface LessonClientViewProps {
  course: Course;
  section: Section;
  lesson: Lesson;
  prevLesson?: Lesson;
  nextLesson?: Lesson;
}

function LessonContent({
  course,
  section,
  lesson,
  prevLesson,
  nextLesson,
}: LessonClientViewProps) {
  const searchParams = useSearchParams();
  const deepLinkT = searchParams.get('t');
  const initialTime = deepLinkT ? parseFloat(deepLinkT) : undefined;

  const isHydrated = useHydrated();
  const playerRef = useRef<VideoPlayerRef>(null);
  const composerInputRef = useRef<HTMLTextAreaElement>(null);

  const markLessonComplete = useLearningStore((s) => s.markLessonComplete);
  const recordActivity = useLearningStore((s) => s.recordActivity);
  const progress = useLearningStore((s) => s.progress);
  const notes = useLearningStore((s) => s.notes);

  const isCompleted = isHydrated && !!progress.lessons[lesson.id]?.completed;
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes'>('transcript');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Count notes for this lesson
  const currentLessonNotesCount = isHydrated
    ? notes.filter((n) => n.lessonId === lesson.id).length
    : 0;

  // Toggle lesson complete
  const toggleComplete = () => {
    markLessonComplete(course.id, lesson.id, !isCompleted);
    recordActivity();
  };

  // Imperative player controls for panels
  const handleSeek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds);
  }, []);

  const handlePlay = useCallback(() => {
    playerRef.current?.play();
  }, []);

  const handlePause = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  // Time update callback from VideoPlayer (4 times/sec)
  const handleTimeUpdate = useCallback((t: number) => {
    setCurrentTime(t);
  }, []);

  // Play state callback from VideoPlayer
  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  // Global Keyboard shortcut: 'N' opens Notes composer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setActiveTab('notes');
        setTimeout(() => {
          composerInputRef.current?.focus();
        }, 80);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
            initialTime={initialTime}
            onTimeUpdate={handleTimeUpdate}
            onPlayStateChange={handlePlayStateChange}
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

          {/* Connected Tabs Area Below Player (Transcript & Notes) */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'transcript' | 'notes')}
              className="w-full"
            >
              <TabsList variant="line" className="w-full justify-start border-b border-border/80 h-10 p-0 gap-6">
                <TabsTrigger
                  value="transcript"
                  className="text-xs sm:text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-2.5 gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Transcript</span>
                  <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5">
                    {lesson.transcript.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="notes"
                  className="text-xs sm:text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-2.5 gap-1.5"
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  <span>Notes</span>
                  {currentLessonNotesCount > 0 && (
                    <Badge variant="default" className="text-[10px] h-4.5 px-1.5 rounded-full">
                      {currentLessonNotesCount}
                    </Badge>
                  )}
                  <span className="hidden sm:inline text-[10px] text-muted-foreground ml-1">
                    (Press N)
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Transcript Tab */}
              <TabsContent value="transcript" className="pt-4">
                <TranscriptPanel
                  lines={lesson.transcript}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                  onPlay={handlePlay}
                />
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="pt-4">
                <NotesPanel
                  course={course}
                  currentLesson={lesson}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onSeek={handleSeek}
                  onPause={handlePause}
                  onResume={handlePlay}
                  composerRef={composerInputRef}
                />
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

export function LessonClientView(props: LessonClientViewProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
          <div className="aspect-video w-full max-w-4xl bg-muted rounded-2xl mb-6" />
          <div className="h-20 max-w-4xl bg-muted/60 rounded-xl" />
        </div>
      }
    >
      <LessonContent {...props} />
    </Suspense>
  );
}
