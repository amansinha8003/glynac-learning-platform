'use client';

import Link from 'next/link';
import { Course } from '@/types/learning';
import { Award, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificatesCardProps {
  completedCourses: Course[];
}

export function CertificatesCard({ completedCourses }: CertificatesCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Certificates Earned</h3>
            <p className="text-[10px] text-muted-foreground">Official completion credentials</p>
          </div>
        </div>

        <span className="text-xs font-bold text-foreground font-mono tabular-nums">
          {completedCourses.length}
        </span>
      </div>

      {completedCourses.length === 0 ? (
        <div className="p-6 text-center space-y-2.5">
          <div className="h-10 w-10 mx-auto rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-foreground">No Certificates Yet</p>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
            Complete 100% of any course syllabus and pass the assessments to unlock your certificate.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {completedCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-foreground truncate block">
                    {course.title}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                  Level: {course.level} • {course.category}
                </span>
              </div>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-[11px] font-semibold shrink-0 gap-1"
              >
                <Link href={`/courses/${course.slug}/certificate`}>
                  View
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

