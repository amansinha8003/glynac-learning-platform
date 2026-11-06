import { Suspense } from 'react';
import { CatalogView } from '@/components/courses/CatalogView';
import { CatalogSkeleton } from '@/components/courses/CatalogSkeleton';

function CatalogFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="h-48 w-full rounded-3xl bg-muted/50 animate-pulse mb-10" />
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="hidden lg:block w-72 h-96 rounded-2xl bg-muted/40 animate-pulse shrink-0" />
        <div className="flex-1 w-full">
          <CatalogSkeleton count={9} />
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogView />
    </Suspense>
  );
}
