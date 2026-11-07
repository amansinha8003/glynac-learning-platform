'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Course, Instructor } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { getCourseProgressPercent } from '@/lib/selectors';
import { useHydrated } from '@/lib/useHydrated';
import { CourseSummaryCard } from './CourseSummaryCard';
import { SyllabusAccordion } from './SyllabusAccordion';
import { InstructorCard } from './InstructorCard';
import { ReviewsList } from './ReviewsList';
import { CourseCard } from '@/components/courses/CourseCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  Clock,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  PlayCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface CourseDetailViewProps {
  course: Course;
  instructor: Instructor;
  relatedCourses: Course[];
  instructorCourseCount: number;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function CourseDetailView({
  course,
  instructor,
  relatedCourses,
  instructorCourseCount,
}: CourseDetailViewProps) {
  const isHydrated = useHydrated();
  const enrolledCourseIds = useLearningStore((s) => s.enrolledCourseIds);
  const progress = useLearningStore((s) => s.progress);
  const enrollCourse = useLearningStore((s) => s.enrollCourse);

  const [justEnrolled, setJustEnrolled] = useState(false);

  const isEnrolled = isHydrated && enrolledCourseIds.includes(course.id);
  const progressPercent = isEnrolled ? getCourseProgressPercent(course, progress) : 0;
  const isCompleted = progressPercent === 100;

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const lastId = isHydrated ? progress.courses[course.id]?.lastLessonId : undefined;
  const targetLesson =
    allLessons.find((l) => l.id === lastId) ||
    allLessons.find((l) => isHydrated && !progress.lessons[l.id]?.completed) ||
    allLessons[0];
  const targetLessonId = targetLesson?.id || '';

  const handleEnroll = () => {
    enrollCourse(course.id);
    setJustEnrolled(true);
    setTimeout(() => {
      setJustEnrolled(false);
    }, 2500);
  };

  // Derive "What you'll learn" bullet points from lessons
  const learningObjectives = allLessons.slice(0, 8).map((lesson) => {
    return `Understand and implement ${lesson.title.toLowerCase()}`;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-6">
        <Link href="/courses" className="hover:text-foreground transition-colors">
          Courses
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link
          href={`/courses?category=${encodeURIComponent(course.category)}`}
          className="hover:text-foreground transition-colors"
        >
          {course.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-foreground font-medium truncate max-w-xs sm:max-w-md">
          {course.title}
        </span>
      </nav>

      {/* Main Layout Grid (2 Columns on Desktop, 1 on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (Hero + Tabs) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Hero Section */}
          <section className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-semibold text-xs">
                {course.category}
              </Badge>
              <Badge variant="outline" className="font-semibold text-xs">
                {course.level}
              </Badge>
              {course.popularity > 90 && (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-semibold gap-1">
                  <Sparkles className="h-3 w-3" />
                  Bestseller
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-[1.2]">
              {course.title}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
              {course.description}
            </p>

            {/* Key Metadata Row */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-foreground">{course.rating.toFixed(2)}</span>
                <span>({course.ratingsCount.toLocaleString()} ratings)</span>
              </div>

              <span>•</span>

              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(course.durationMinutes)}</span>
              </div>

              <span>•</span>

              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{allLessons.length} lessons</span>
              </div>

              <span>•</span>

              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>
                  Taught by <strong className="text-foreground">{instructor.name}</strong>
                </span>
              </div>
            </div>

            {/* Mobile Hero Actions & Progress (sits right under hero on mobile) */}
            <div className="block lg:hidden pt-4">
              {!isHydrated ? (
                <div className="h-11 w-full bg-muted animate-pulse rounded-xl" />
              ) : justEnrolled ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Enrolled! Ready to learn</span>
                </motion.div>
              ) : !isEnrolled ? (
                <Button
                  type="button"
                  onClick={handleEnroll}
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

              {/* Mobile Progress Bar */}
              <AnimatePresence>
                {isHydrated && isEnrolled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 pt-3"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Progress</span>
                      <span className="font-bold text-primary">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Interactive Navigation Tabs */}
          <Tabs defaultValue="overview" className="w-full pt-4">
            <TabsList variant="line" className="w-full justify-start border-b border-border/80 h-11 p-0 gap-6">
              <TabsTrigger
                value="overview"
                className="text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="syllabus"
                className="text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3"
              >
                Syllabus ({allLessons.length})
              </TabsTrigger>
              <TabsTrigger
                value="instructor"
                className="text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3"
              >
                Instructor
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-3"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-8 pt-6">
              {/* What You'll Learn Checklist */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  What you&apos;ll learn
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {learningObjectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-snug text-foreground">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Description */}
              <div className="space-y-3">
                <h3 className="font-bold text-base sm:text-lg text-foreground">
                  Course Description
                </h3>
                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-3">
                  <p>{course.description}</p>
                  <p>
                    Throughout this curriculum, you will build production-caliber mental models, dissect real architectural codebases, and complete progressive checkpoints designed to simulate real industry challenges.
                  </p>
                </div>
              </div>

              {/* Requirements & Prerequisites */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Requirements & Prerequisites
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-muted-foreground pl-1">
                  <li>Basic familiarity with programming principles and modern web conventions.</li>
                  <li>A modern web browser with developer tools and a code editor (e.g. VS Code).</li>
                  <li>No prior specialized framework experience required; foundational concepts are covered step-by-step.</li>
                </ul>
              </div>
            </TabsContent>

            {/* TAB 2: SYLLABUS */}
            <TabsContent value="syllabus" className="pt-6">
              <SyllabusAccordion course={course} />
            </TabsContent>

            {/* TAB 3: INSTRUCTOR */}
            <TabsContent value="instructor" className="pt-6">
              <InstructorCard
                instructor={instructor}
                courseCount={instructorCourseCount}
              />
            </TabsContent>

            {/* TAB 4: REVIEWS */}
            <TabsContent value="reviews" className="pt-6">
              <ReviewsList
                courseId={course.id}
                courseRating={course.rating}
                ratingsCount={course.ratingsCount}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Sticky Summary Card on Desktop */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <CourseSummaryCard
            course={course}
            targetLessonId={targetLessonId}
            onEnroll={handleEnroll}
            justEnrolled={justEnrolled}
          />
        </div>
      </div>

      {/* Related Courses Row */}
      {relatedCourses.length > 0 && (
        <section className="mt-16 sm:mt-24 pt-10 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                More in {course.category}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Explore related masterclasses to deepen your expertise
              </p>
            </div>

            <Button asChild variant="ghost" size="sm" className="text-xs font-semibold gap-1">
              <Link href={`/courses?category=${encodeURIComponent(course.category)}`}>
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map((rel) => (
              <CourseCard key={rel.id} course={rel} instructor={instructor} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
