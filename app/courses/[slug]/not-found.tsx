import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CourseNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="h-16 w-16 mx-auto rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground mb-6 shadow-xs">
        <BookOpen className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Course Not Found
      </h1>

      <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
        We could not find the course you were looking for. It may have been updated, renamed, or is temporarily unavailable.
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild className="gap-2">
          <Link href="/courses">
            <ArrowLeft className="h-4 w-4" />
            Browse all courses
          </Link>
        </Button>
      </div>
    </div>
  );
}

