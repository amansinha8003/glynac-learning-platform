'use client';

import { useState, useEffect } from 'react';
import { CourseLevel } from '@/types/learning';
import { DurationFilter, SortOption } from '@/lib/catalog';
import { Search, X, RotateCcw, SlidersHorizontal, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  categories: string[];
  allCategories: string[];
  onCategoryToggle: (category: string) => void;
  levels: CourseLevel[];
  onLevelToggle: (level: CourseLevel) => void;
  duration: DurationFilter;
  onDurationChange: (duration: DurationFilter) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeFiltersCount: number;
  onClearAll: () => void;
  categoryCounts?: Record<string, number>;
}

const ALL_LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

const DURATION_OPTIONS: { id: DurationFilter; label: string }[] = [
  { id: 'all', label: 'All Durations' },
  { id: 'under-2h', label: 'Under 2 hours' },
  { id: '2-5h', label: '2 - 5 hours' },
  { id: '5h-plus', label: '5+ hours' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'popular', label: 'Most popular' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'newest', label: 'Newest releases' },
  { id: 'duration', label: 'Duration: Short to Long' },
  { id: 'title', label: 'Title: A to Z' },
];

export function CatalogFilters({
  search,
  onSearchChange,
  categories,
  allCategories,
  onCategoryToggle,
  levels,
  onLevelToggle,
  duration,
  onDurationChange,
  sort,
  onSortChange,
  activeFiltersCount,
  onClearAll,
  categoryCounts = {},
}: CatalogFiltersProps) {
  const [prevSearch, setPrevSearch] = useState(search);
  const [localSearch, setLocalSearch] = useState(search);

  // Sync external search changes into local state during render
  if (prevSearch !== search) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  // Debounce search update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  return (
    <div className="space-y-6">
      {/* Header with Active Filters Count and Clear */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm tracking-wide uppercase text-foreground">Filters</h2>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="h-5 px-1.5 text-[11px] rounded-full">
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div>
        <label htmlFor="course-search-input" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="course-search-input"
            type="text"
            placeholder="Title, tag, instructor..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 pr-8 h-10 text-sm bg-background"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sort Option */}
      <div>
        <label htmlFor="catalog-sort-select" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Sort By
        </label>
        <select
          id="catalog-sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories Multi-Select Chips */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </span>
          {categories.length > 0 && (
            <span className="text-[11px] text-muted-foreground">{categories.length} selected</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {allCategories.map((cat) => {
            const isSelected = categories.includes(cat);
            const count = categoryCounts[cat];

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryToggle(cat)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left border ${
                  isSelected
                    ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                    : 'bg-background hover:bg-muted text-foreground border-border/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground/40 bg-background'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span>{cat}</span>
                </div>
                {count !== undefined && (
                  <span className="text-[11px] text-muted-foreground">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Level Filter */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Difficulty Level
          </span>
          {levels.length > 0 && (
            <span className="text-[11px] text-muted-foreground">{levels.length} selected</span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {ALL_LEVELS.map((lvl) => {
            const isSelected = levels.includes(lvl);
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onLevelToggle(lvl)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left border ${
                  isSelected
                    ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                    : 'bg-background hover:bg-muted text-foreground border-border/60'
                }`}
              >
                <div
                  className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground/40 bg-background'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <span>{lvl}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration Filter */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
          Duration
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = duration === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onDurationChange(opt.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left border ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                    : 'bg-background hover:bg-muted text-foreground border-border/60'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
