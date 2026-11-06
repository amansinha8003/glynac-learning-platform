'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function CatalogPagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalCount,
  onPageChange,
}: CatalogPaginationProps) {
  if (totalCount === 0) return null;

  // Generate page numbers
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
      {/* Result Count Info */}
      <p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-semibold text-foreground">{startIndex}</span>–
        <span className="font-semibold text-foreground">{endIndex}</span> of{' '}
        <span className="font-semibold text-foreground">{totalCount}</span> courses
      </p>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 order-1 sm:order-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-9 px-3 gap-1 text-xs font-medium"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pages.map((p) => {
              const isActive = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`h-9 w-9 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center border ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-9 px-3 gap-1 text-xs font-medium"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

