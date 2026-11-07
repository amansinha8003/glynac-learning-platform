import Link from 'next/link';
import { notFound } from 'next/navigation';
import { courses } from '@/data';
import { ChevronRight, ArrowLeft, Play, Sparkles, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  const params: { slug: string; lessonId: string }[] = [];
  for (const course of courses) {
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        params.push({ slug: course.slug, lessonId: lesson.id });
      }
    }
  }
  return params;
}

export default async function LessonPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    notFound();
  }

  const section = course.sections.find((s) =>
    s.lessons.some((l) => l.id === lessonId)
  );

  const lesson = section?.lessons.find((l) => l.id === lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-6">
        <Link href="/courses" className="hover:text-foreground transition-colors">
          Courses
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link
          href={`/courses/${course.slug}`}
          className="hover:text-foreground transition-colors truncate max-w-xs"
        >
          {course.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-foreground font-medium truncate max-w-xs">
          {lesson.title}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {section?.title}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{Math.round(lesson.durationSeconds / 60)} min</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {lesson.title}
          </h1>
        </div>

        <Button asChild variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
          <Link href={`/courses/${course.slug}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
        </Button>
      </div>

      {/* Video Player Placeholder Box */}
      <div className="relative aspect-video w-full rounded-3xl border border-border bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-950 flex flex-col items-center justify-center text-center p-8 text-white shadow-xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-5 backdrop-blur-md shadow-lg">
            <Play className="h-9 w-9 text-primary fill-primary ml-1" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Classroom Experience</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Video Player & Interactive Classroom
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">
            The full video player with synchronized interactive transcripts, timestamped notes, and interactive quizzes is coming in the next step.
          </p>

          <div className="mt-6">
            <Button asChild variant="secondary" size="sm" className="font-semibold text-xs">
              <Link href={`/courses/${course.slug}`}>Return to Course Overview</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

