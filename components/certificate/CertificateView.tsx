'use client';

import { useEffect, useMemo } from 'react';
import { Course, Instructor, Quiz } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import { isCourseComplete, getCertificateData } from '@/lib/certificate';
import { CertificateToolbar } from './CertificateToolbar';
import { CertificatePaper } from './CertificatePaper';
import { LockedCertificate } from './LockedCertificate';
import { ConfettiBurst } from './ConfettiBurst';

interface CertificateViewProps {
  course: Course;
  instructor?: Instructor;
  allQuizzes: Quiz[];
}

export function CertificateView({ course, instructor, allQuizzes }: CertificateViewProps) {
  const isHydrated = useHydrated();

  // Zustand Store
  const displayName = useLearningStore((s) => s.displayName);
  const setDisplayName = useLearningStore((s) => s.setDisplayName);
  const enrolledCourseIds = useLearningStore((s) => s.enrolledCourseIds);
  const progress = useLearningStore((s) => s.progress);
  const quizAttempts = useLearningStore((s) => s.quizAttempts);
  const celebratedCertificates = useLearningStore((s) => s.celebratedCertificates);
  const markCertificateCelebrated = useLearningStore((s) => s.markCertificateCelebrated);
  const setCourseCompletedAt = useLearningStore((s) => s.setCourseCompletedAt);
  const hasStoreHydrated = useLearningStore((s) => s.hasHydrated);

  const isReady = isHydrated && hasStoreHydrated;

  // Evaluate course completion eligibility
  const completionStatus = useMemo(() => {
    if (!isReady) {
      return {
        isComplete: false,
        isEnrolled: false,
        completedLessonsCount: 0,
        totalLessonsCount: 0,
        remainingLessons: [],
        passedQuizzesCount: 0,
        totalQuizzesCount: 0,
        unpassedQuizzes: [],
      };
    }
    return isCourseComplete(course, enrolledCourseIds, progress, quizAttempts, allQuizzes);
  }, [course, enrolledCourseIds, progress, quizAttempts, allQuizzes, isReady]);

  // Check one-time celebration confetti
  const shouldCelebrate =
    isReady && completionStatus.isComplete && !celebratedCertificates.includes(course.id);

  // Persist completedAt if not yet saved upon completion
  useEffect(() => {
    if (isReady && completionStatus.isComplete && !completionStatus.completedAt) {
      setCourseCompletedAt(course.id);
    }
  }, [isReady, completionStatus.isComplete, completionStatus.completedAt, course.id, setCourseCompletedAt]);

  useEffect(() => {
    if (shouldCelebrate) {
      markCertificateCelebrated(course.id);
    }
  }, [shouldCelebrate, course.id, markCertificateCelebrated]);

  // Loading skeleton while reading persisted store
  if (!isReady) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-10 w-full bg-muted/60 rounded-2xl" />
        <div className="aspect-[297/210] w-full rounded-2xl bg-muted/40 border border-border" />
      </div>
    );
  }

  // If not completed, show locked screen with exact remaining checklist
  if (!completionStatus.isComplete) {
    return <LockedCertificate course={course} status={completionStatus} />;
  }

  const effectiveCompletedAt =
    completionStatus.completedAt || progress.courses[course.id]?.completedAt || new Date().toISOString();

  const certificateData = getCertificateData(
    course,
    instructor,
    displayName || 'Learner',
    effectiveCompletedAt,
    quizAttempts,
    allQuizzes
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Confetti celebration burst (runs only once per course) */}
      {shouldCelebrate && <ConfettiBurst />}

      {/* Top action toolbar (hidden when printing) */}
      <CertificateToolbar
        courseSlug={course.slug}
        learnerName={displayName || 'Learner'}
        onUpdateName={setDisplayName}
      />

      {/* Printable Certificate Container */}
      <div className="print-certificate-container flex justify-center items-center w-full overflow-x-auto py-2">
        <CertificatePaper data={certificateData} />
      </div>
    </div>
  );
}
