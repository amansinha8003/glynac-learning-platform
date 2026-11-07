import Link from 'next/link';
import { Compass, BookOpen, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
          <Compass className="h-12 w-12 animate-pulse text-primary" aria-hidden="true" />
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page or course material you are looking for doesn’t exist or might have been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="w-full sm:w-auto gap-2">
            <Link href="/courses">
              <BookOpen className="h-4 w-4" />
              Browse Courses
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto gap-2">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              My Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

