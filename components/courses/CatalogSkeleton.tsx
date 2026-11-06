export function CatalogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse flex flex-col"
        >
          {/* Thumbnail Skeleton */}
          <div className="h-44 w-full bg-muted/60 relative">
            <div className="absolute top-3 right-3 h-5 w-16 bg-muted-foreground/20 rounded-full" />
            <div className="absolute bottom-3 left-3 h-5 w-24 bg-muted-foreground/20 rounded-full" />
          </div>

          {/* Content Skeleton */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 bg-muted/80 rounded" />
              <div className="h-4 w-16 bg-muted/80 rounded" />
            </div>

            <div className="h-5 w-4/5 bg-muted rounded mb-2" />
            <div className="h-5 w-3/5 bg-muted rounded mb-4" />

            <div className="h-3.5 w-1/3 bg-muted/70 rounded mb-6" />

            <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
              <div className="h-3 w-28 bg-muted/60 rounded" />
              <div className="h-3 w-16 bg-muted/60 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

