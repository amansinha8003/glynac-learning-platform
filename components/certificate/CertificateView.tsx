'use client';

import Link from 'next/link';
import { Course, Instructor } from '@/types/learning';
import { Award, ArrowLeft, Printer, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface CertificateViewProps {
  course: Course;
  instructor?: Instructor;
}

export function CertificateView({ course, instructor }: CertificateViewProps) {
  const currentDate = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Top action bar - Hidden during print */}
      <div className="flex items-center justify-between print:hidden">
        <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
          <Link href={`/courses/${course.slug}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
        </Button>
        <Button
          size="sm"
          className="gap-2 text-xs"
          onClick={() => {
            if (typeof window !== 'undefined') window.print();
          }}
        >
          <Printer className="h-4 w-4" />
          Print Certificate
        </Button>
      </div>

      {/* Certificate Frame */}
      <div className="relative rounded-3xl border-8 border-double border-primary/20 bg-card p-8 sm:p-14 shadow-xl text-center space-y-8 overflow-hidden print:border-foreground/30 print:shadow-none">
        {/* Decorative corner accents */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/40 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/40 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/40 rounded-br-xl pointer-events-none" />

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-2">
            <Award className="h-8 w-8 stroke-[2.5]" />
          </div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-primary">
            Certificate of Completion
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Glynac Learning Academy
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            This official credential verifies the successful mastery and completion of
          </p>
        </div>

        {/* Course Title Badge */}
        <div className="py-4 px-6 rounded-2xl bg-muted/40 border border-border max-w-xl mx-auto">
          <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {course.title}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-2">
            <span>Level: {course.level}</span>
            <span>•</span>
            <span>Category: {course.category}</span>
          </div>
        </div>

        {/* Verification Text */}
        <div className="max-w-md mx-auto text-xs text-muted-foreground leading-relaxed">
          Granted to the learner for demonstrating knowledge, passing all course curriculum
          assessments, and completing interactive technical lessons.
        </div>

        {/* Signatures & Metadata */}
        <div className="pt-8 border-t border-border grid grid-cols-2 gap-6 max-w-lg mx-auto text-center">
          <div className="space-y-1">
            <div className="font-serif italic text-base text-foreground font-semibold">
              {instructor?.name ?? 'Course Instructor'}
            </div>
            <div className="h-0.5 w-28 bg-border mx-auto" />
            <div className="text-[11px] text-muted-foreground">Lead Instructor</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground font-mono">
              {currentDate}
            </div>
            <div className="h-0.5 w-28 bg-border mx-auto" />
            <div className="text-[11px] text-muted-foreground">Date of Issuance</div>
          </div>
        </div>

        {/* Security seal */}
        <div className="pt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Verified Digital Credential • ID: GLY-{course.id.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
