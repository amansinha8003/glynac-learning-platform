'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileFiltersDialogProps {
  activeFiltersCount: number;
  totalFilteredCount: number;
  children: React.ReactNode;
}

export function MobileFiltersDialog({
  activeFiltersCount,
  totalFilteredCount,
  children,
}: MobileFiltersDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="lg:hidden flex items-center gap-2 font-medium h-10 px-4"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="h-5 px-1.5 text-xs rounded-full">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="mb-4 pb-2 border-b border-border">
          <DialogTitle className="text-lg font-bold flex items-center justify-between">
            <span>Filter Courses</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} Active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {children}

        <div className="mt-6 pt-4 border-t border-border">
          <Button
            type="button"
            className="w-full font-semibold"
            onClick={() => setOpen(false)}
          >
            Show {totalFilteredCount} {totalFilteredCount === 1 ? 'Course' : 'Courses'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

