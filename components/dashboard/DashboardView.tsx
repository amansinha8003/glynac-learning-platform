'use client';

import { useMemo } from 'react';
import { Course, Quiz } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import {
  getCourseProgressPercent,
  getContinueLearning,
  getCompletedCourses,
} from '@/lib/selectors';
import { getCurrentStreak } from '@/lib/streak';
import { motion, useReducedMotion } from 'framer-motion';

import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHero } from './DashboardHero';
import { StatCard } from './StatCard';
import { ContinueCarousel, InProgressCourseItem } from './ContinueCarousel';
import { CourseRingsGrid } from './CourseRingsGrid';
import { RecentQuizzes } from './RecentQuizzes';
import { ProfileCard } from './ProfileCard';
import { StreakCalendar } from './StreakCalendar';
import { WeeklyChart } from './WeeklyChart';
import { CertificatesCard } from './CertificatesCard';

import { BookOpen, CheckCircle, Clock, Award } from 'lucide-react';

interface DashboardViewProps {
  courses: Course[];
  quizzes: Quiz[];
}

export function DashboardView({ courses, quizzes }: DashboardViewProps) {
  const isHydrated = useHydrated();
  const shouldReduceMotion = useReducedMotion();

  // Zustand Store
  const displayName = useLearningStore((s) => s.displayName);
  const setDisplayName = useLearningStore((s) => s.setDisplayName);
  const enrolledCourseIds = useLearningStore((s) => s.enrolledCourseIds);
  const progress = useLearningStore((s) => s.progress);
  const quizAttempts = useLearningStore((s) => s.quizAttempts);
  const streakDates = useLearningStore((s) => s.streakDates);
  const activityByDate = useLearningStore((s) => s.activityByDate);
  const hasStoreHydrated = useLearningStore((s) => s.hasHydrated);

  const isReady = isHydrated && hasStoreHydrated;

  // Enrolled courses list
  const enrolledCourses = useMemo(() => {
    return courses.filter((c) => enrolledCourseIds.includes(c.id));
  }, [courses, enrolledCourseIds]);

  // Completed courses list
  const completedCourses = useMemo(() => {
    return getCompletedCourses(courses, progress);
  }, [courses, progress]);

  // In-progress courses for carousel
  const inProgressList = useMemo<InProgressCourseItem[]>(() => {
    return enrolledCourses
      .filter((c) => {
        const pct = getCourseProgressPercent(c, progress);
        return pct < 100;
      })
      .map((course) => {
        const allLessons = course.sections.flatMap((s) => s.lessons);
        const completedCount = allLessons.filter((l) => progress.lessons[l.id]?.completed).length;
        const lastLessonId = progress.courses[course.id]?.lastLessonId;
        let nextLesson = allLessons.find((l) => l.id === lastLessonId);

        if (!nextLesson || progress.lessons[nextLesson.id]?.completed) {
          nextLesson = allLessons.find((l) => !progress.lessons[l.id]?.completed) || allLessons[0];
        }

        return {
          course,
          nextLesson,
          percent: getCourseProgressPercent(course, progress),
          completedCount,
          totalCount: allLessons.length,
        };
      });
  }, [enrolledCourses, progress]);

  // Overall completion average across enrolled courses
  const overallProgressPercent = useMemo(() => {
    if (enrolledCourses.length === 0) return 0;
    const total = enrolledCourses.reduce(
      (acc, c) => acc + getCourseProgressPercent(c, progress),
      0
    );
    return Math.round(total / enrolledCourses.length);
  }, [enrolledCourses, progress]);

  // Lessons completed count
  const completedLessonsCount = useMemo(() => {
    return Object.values(progress.lessons).filter((l) => l.completed).length;
  }, [progress.lessons]);

  // Hours learned calculation
  const hoursLearned = useMemo(() => {
    const totalSeconds = courses.reduce((acc, c) => {
      return (
        acc +
        c.sections.reduce((sAcc, s) => {
          return (
            sAcc +
            s.lessons.reduce((lAcc, l) => {
              return lAcc + (progress.lessons[l.id]?.completed ? l.durationSeconds : 0);
            }, 0)
          );
        }, 0)
      );
    }, 0);
    return parseFloat((totalSeconds / 3600).toFixed(1));
  }, [courses, progress.lessons]);

  // Average quiz score
  const quizAverageScore = useMemo(() => {
    if (quizAttempts.length === 0) return 0;
    const sum = quizAttempts.reduce((acc, a) => acc + a.scorePercent, 0);
    return Math.round(sum / quizAttempts.length);
  }, [quizAttempts]);

  // Hero continue learning URL
  const heroContinueUrl = useMemo(() => {
    const continueItem = getContinueLearning(courses, enrolledCourseIds, progress);
    if (continueItem) {
      return `/courses/${continueItem.course.slug}/learn/${continueItem.lesson.id}`;
    }
    if (inProgressList.length > 0) {
      return `/courses/${inProgressList[0].course.slug}/learn/${inProgressList[0].nextLesson.id}`;
    }
    return null;
  }, [courses, enrolledCourseIds, progress, inProgressList]);

  // Current streak
  const currentStreak = useMemo(() => {
    return getCurrentStreak(streakDates, activityByDate);
  }, [streakDates, activityByDate]);

  // Loading skeleton layout matching dashboard structure
  if (!isReady) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
        <div className="h-44 rounded-3xl bg-muted/60" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 rounded-2xl bg-muted/40" />
          <div className="h-28 rounded-2xl bg-muted/40" />
          <div className="h-28 rounded-2xl bg-muted/40" />
          <div className="h-28 rounded-2xl bg-muted/40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 rounded-2xl bg-muted/40" />
            <div className="h-64 rounded-2xl bg-muted/40" />
          </div>
          <div className="space-y-6">
            <div className="h-32 rounded-2xl bg-muted/40" />
            <div className="h-72 rounded-2xl bg-muted/40" />
          </div>
        </div>
      </div>
    );
  }

  // Animation variants for smooth staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: 'easeOut' as const },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Left Zone: Sidebar (~220px on desktop) */}
        <DashboardSidebar />

        {/* Center Zone: Main Column */}
        <main className="flex-1 min-w-0 space-y-6 w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* 1. Welcome Hero */}
            <motion.div variants={itemVariants}>
              <DashboardHero
                displayName={displayName || 'Learner'}
                streakCount={currentStreak}
                continueLessonUrl={heroContinueUrl}
                onUpdateDisplayName={setDisplayName}
              />
            </motion.div>

            {/* 2. Stat Cards Row (4 Cards) */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
            >
              <StatCard
                title="Courses Enrolled"
                value={enrolledCourseIds.length}
                caption="Enrolled curriculums"
                icon={BookOpen}
              />
              <StatCard
                title="Lessons Completed"
                value={completedLessonsCount}
                caption="Modules mastered"
                icon={CheckCircle}
              />
              <StatCard
                title="Hours Learned"
                value={hoursLearned}
                caption="Watch time logged"
                icon={Clock}
                suffix="h"
                precision={hoursLearned > 0 && hoursLearned < 10 ? 1 : 0}
              />
              <StatCard
                title="Quiz Average"
                value={quizAverageScore}
                caption="Assessment retention"
                icon={Award}
                suffix="%"
              />
            </motion.div>

            {/* 3. Continue Learning Row (Horizontal snap carousel) */}
            <motion.div variants={itemVariants}>
              <ContinueCarousel items={inProgressList} />
            </motion.div>

            {/* 4. Completion Rings Grid */}
            <motion.div variants={itemVariants}>
              <CourseRingsGrid courses={enrolledCourses} progress={progress} />
            </motion.div>

            {/* 5. Recent Quiz Results */}
            <motion.div variants={itemVariants}>
              <RecentQuizzes
                attempts={quizAttempts}
                quizzes={quizzes}
                courses={courses}
              />
            </motion.div>
          </motion.div>
        </main>

        {/* Right Zone: Aside Panel (~320px) */}
        <aside
          className="w-full xl:w-[320px] shrink-0 space-y-6"
          aria-label="Learner stats and profile overview"
        >
          {/* 6. Profile Card */}
          <ProfileCard
            displayName={displayName || 'Learner'}
            overallProgressPercent={overallProgressPercent}
            enrolledCount={enrolledCourses.length}
            completedCount={completedCourses.length}
          />

          {/* 7. Streak Calendar */}
          <StreakCalendar
            streakDates={streakDates}
            activityByDate={activityByDate}
          />

          {/* 8. Weekly Activity Chart */}
          <WeeklyChart
            activityByDate={activityByDate}
            streakDates={streakDates}
          />

          {/* 9. Certificates Earned */}
          <div id="certificates">
            <CertificatesCard completedCourses={completedCourses} />
          </div>
        </aside>
      </div>
    </div>
  );
}

