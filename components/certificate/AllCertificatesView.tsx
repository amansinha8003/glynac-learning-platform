'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Course, Quiz } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import { isCourseComplete, buildCertificateId } from '@/lib/certificate';
import { format } from 'date-fns';
import { Award, Compass, ExternalLink, Printer, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AllCertificatesViewProps {
  courses: Course[];
  allQuizzes: Quiz[];
}

export function AllCertificatesView({ courses, allQuizzes }: AllCertificatesViewProps) {
  const isHydrated = useHydrated();
  const enrolledCourseIds = useLearningStore((s) => s.enrolledCourseIds);
  const progress = useLearningStore((s) => s.progress);
  const quizAttempts = useLearningStore((s) => s.quizAttempts);
  const displayName = useLearningStore((s) => s.displayName);
  const hasStoreHydrated = useLearningStore((s) => s.hasHydrated);

  const isReady = isHydrated && hasStoreHydrated;

  const earnedCertificates = useMemo(() => {
    if (!isReady) return [];

    return courses
      .map((course) => {
        const status = isCourseComplete(
          course,
          enrolledCourseIds,
          progress,
          quizAttempts,
          allQuizzes
        );
        if (!status.isComplete) return null;

        const completedAt =
          status.completedAt ||
          progress.courses[course.id]?.completedAt ||
          new Date().toISOString();

        const certId = buildCertificateId(course.id, displayName || 'Learner', completedAt);

        let formattedDate = 'Recently';
        try {
          formattedDate = format(new Date(completedAt), 'd MMMM yyyy');
        } catch {
          formattedDate = 'Recently';
        }

        return {
          course,
          completedAt,
          formattedDate,
          certId,
        };
      })
      .filter(Boolean) as {
      course: Course;
      completedAt: string;
      formattedDate: string;
      certId: string;
    }[];
  }, [courses, enrolledCourseIds, progress, quizAttempts, allQuizzes, displayName, isReady]);

  if (!isReady) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-8 w-60 bg-muted/60 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-2xl bg-muted/40" />
          <div className="h-64 rounded-2xl bg-muted/40" />
          <div className="h-64 rounded-2xl bg-muted/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <Award className="h-4 w-4" />
          <span>Academic Credentials</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Your Earned Certificates
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
          Official completion certificates for curricula where you have mastered all modules and passed all assessments.
        </p>
      </div>

      {earnedCertificates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 sm:p-14 text-center space-y-4 max-w-xl mx-auto">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-primary-soft text-primary flex items-center justify-center shadow-xs">
            <Award className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">No Certificates Earned Yet</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              Complete a course to earn your first certificate. Every lesson and assessment must be completed.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="sm" className="gap-2 text-xs font-semibold shadow-xs">
              <Link href="/courses">
                <Compass className="h-3.5 w-3.5" />
                Browse Catalog
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {earnedCertificates.map(({ course, formattedDate, certId }) => (
            <div
              key={course.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="space-y-4">
                {/* Certificate mini banner */}
                <div
                  className={`h-24 rounded-xl flex items-center justify-between px-4 text-white relative overflow-hidden bg-gradient-to-r ${course.thumbnail.gradient}`}
                >
                  <Badge
                    variant="secondary"
                    className="bg-black/30 backdrop-blur-md text-white border-none text-[10px] font-semibold"
                  >
                    {course.category}
                  </Badge>
                  <span className="text-3xl select-none">{course.thumbnail.emoji}</span>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Issued: {formattedDate}</span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-zinc-500 pt-1">
                    ID: {certId}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border mt-4 flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 gap-1.5 text-xs font-semibold"
                >
                  <Link href={`/courses/${course.slug}/certificate`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="flex-1 h-8 gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <Link href={`/courses/${course.slug}/certificate`}>
                    <Printer className="h-3.5 w-3.5" />
                    Print
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

