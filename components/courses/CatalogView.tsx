'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { courses, instructors } from '@/data';
import { CourseLevel } from '@/types/learning';
import {
  filterCourses,
  sortCourses,
  paginate,
  SortOption,
  DurationFilter,
  CatalogFiltersState,
} from '@/lib/catalog';
import { useHydrated } from '@/lib/useHydrated';
import { CourseCard } from './CourseCard';
import { CatalogFilters } from './CatalogFilters';
import { CatalogHero } from './CatalogHero';
import { CatalogPagination } from './CatalogPagination';
import { CatalogSkeleton } from './CatalogSkeleton';
import { MobileFiltersDialog } from './MobileFiltersDialog';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHydrated = useHydrated();

  // Initial loading simulation (~400ms) to ensure smooth hydration without visual flash
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  // Parse filters from URL search params
  const search = searchParams.get('q') || '';

  const categories = useMemo(() => {
    const all = searchParams.getAll('category');
    if (all.length > 0) return all;
    const single = searchParams.get('category');
    return single ? single.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const levels = useMemo(() => {
    const all = searchParams.getAll('level');
    const raw = all.length > 0 ? all : (searchParams.get('level')?.split(',').filter(Boolean) || []);
    return raw.filter((lvl): lvl is CourseLevel =>
      ['Beginner', 'Intermediate', 'Advanced'].includes(lvl)
    );
  }, [searchParams]);

  const duration = (searchParams.get('duration') as DurationFilter) || 'all';
  const sort = (searchParams.get('sort') as SortOption) || 'popular';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    count += categories.length;
    count += levels.length;
    if (duration !== 'all') count += 1;
    return count;
  }, [search, categories, levels, duration]);

  // URL updater
  const updateUrl = useCallback(
    (newFilters: Partial<CatalogFiltersState>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Search
      const newSearch = newFilters.search !== undefined ? newFilters.search : search;
      if (newSearch && newSearch.trim()) {
        params.set('q', newSearch.trim());
      } else {
        params.delete('q');
      }

      // Categories
      const newCategories =
        newFilters.categories !== undefined ? newFilters.categories : categories;
      params.delete('category');
      newCategories.forEach((c) => params.append('category', c));

      // Levels
      const newLevels = newFilters.levels !== undefined ? newFilters.levels : levels;
      params.delete('level');
      newLevels.forEach((l) => params.append('level', l));

      // Duration
      const newDuration =
        newFilters.duration !== undefined ? newFilters.duration : duration;
      if (newDuration && newDuration !== 'all') {
        params.set('duration', newDuration);
      } else {
        params.delete('duration');
      }

      // Sort
      const newSort = newFilters.sort !== undefined ? newFilters.sort : sort;
      if (newSort && newSort !== 'popular') {
        params.set('sort', newSort);
      } else {
        params.delete('sort');
      }

      // Page (reset to 1 on filter changes unless explicitly specified)
      const newPage = newFilters.page !== undefined ? newFilters.page : 1;
      if (newPage > 1) {
        params.set('page', newPage.toString());
      } else {
        params.delete('page');
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [searchParams, pathname, router, search, categories, levels, duration, sort]
  );

  // Filter & Sort handlers (always reset to page 1)
  const handleSearchChange = (val: string) => updateUrl({ search: val, page: 1 });

  const handleCategoryToggle = (cat: string) => {
    const next = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    updateUrl({ categories: next, page: 1 });
  };

  const handleLevelToggle = (lvl: CourseLevel) => {
    const next = levels.includes(lvl)
      ? levels.filter((l) => l !== lvl)
      : [...levels, lvl];
    updateUrl({ levels: next, page: 1 });
  };

  const handleDurationChange = (dur: DurationFilter) =>
    updateUrl({ duration: dur, page: 1 });

  const handleSortChange = (s: SortOption) => updateUrl({ sort: s, page: 1 });

  const handleClearAll = () => {
    const params = new URLSearchParams();
    if (sort !== 'popular') params.set('sort', sort);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage });
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Precomputed metadata
  const allCategories = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category))).sort(),
    []
  );

  const categoryCounts = useMemo(() => {
    return courses.reduce<Record<string, number>>((acc, course) => {
      acc[course.category] = (acc[course.category] || 0) + 1;
      return acc;
    }, {});
  }, []);

  const instructorMap = useMemo(
    () => new Map(instructors.map((i) => [i.id, i])),
    []
  );

  // Filter, sort, and paginate
  const filteredCourses = useMemo(() => {
    return filterCourses(courses, instructors, {
      search,
      categories,
      levels,
      duration,
    });
  }, [search, categories, levels, duration]);

  const sortedCourses = useMemo(() => {
    return sortCourses(filteredCourses, sort);
  }, [filteredCourses, sort]);

  const pagination = useMemo(() => {
    return paginate(sortedCourses, page, 9);
  }, [sortedCourses, page]);

  const isLoading = initialLoading || !isHydrated;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Hero Strip with Continue Learning shortcut */}
      <CatalogHero />

      {/* Main Catalog Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Filter Sidebar (Sticky) */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-xs">
          <CatalogFilters
            search={search}
            onSearchChange={handleSearchChange}
            categories={categories}
            allCategories={allCategories}
            onCategoryToggle={handleCategoryToggle}
            levels={levels}
            onLevelToggle={handleLevelToggle}
            duration={duration}
            onDurationChange={handleDurationChange}
            sort={sort}
            onSortChange={handleSortChange}
            activeFiltersCount={activeFiltersCount}
            onClearAll={handleClearAll}
            categoryCounts={categoryCounts}
          />
        </aside>

        {/* Catalog Results Column */}
        <div className="flex-1 w-full min-w-0">
          {/* Mobile Top Controls Bar */}
          <div className="flex lg:hidden items-center justify-between gap-3 mb-6 p-4 rounded-xl border border-border bg-card">
            <MobileFiltersDialog
              activeFiltersCount={activeFiltersCount}
              totalFilteredCount={filteredCourses.length}
            >
              <CatalogFilters
                search={search}
                onSearchChange={handleSearchChange}
                categories={categories}
                allCategories={allCategories}
                onCategoryToggle={handleCategoryToggle}
                levels={levels}
                onLevelToggle={handleLevelToggle}
                duration={duration}
                onDurationChange={handleDurationChange}
                sort={sort}
                onSortChange={handleSortChange}
                activeFiltersCount={activeFiltersCount}
                onClearAll={handleClearAll}
                categoryCounts={categoryCounts}
              />
            </MobileFiltersDialog>

            <span className="text-xs font-medium text-muted-foreground">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </span>
          </div>

          {/* Catalog Grid or States */}
          {isLoading ? (
            <CatalogSkeleton count={9} />
          ) : pagination.items.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center p-12 sm:p-16 rounded-3xl border border-dashed border-border bg-card/60">
              <div className="h-16 w-16 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground mb-4 shadow-xs">
                <SearchX className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-xl text-foreground">No courses found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                We could not find any courses matching your current filters or keywords. Try resetting your filters to explore all available topics.
              </p>
              <Button
                onClick={handleClearAll}
                variant="outline"
                className="mt-6 gap-2 font-semibold"
              >
                <RotateCcw className="h-4 w-4" />
                Clear all filters
              </Button>
            </div>
          ) : (
            /* Results Grid (1 col mobile, 2 col tablet, 3 col desktop) */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pagination.items.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    instructor={instructorMap.get(course.instructorId)}
                    searchQuery={search}
                  />
                ))}
              </div>

              {/* Numbered Pagination */}
              <CatalogPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                startIndex={pagination.startIndex}
                endIndex={pagination.endIndex}
                totalCount={pagination.totalCount}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

