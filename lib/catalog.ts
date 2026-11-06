import { Course, CourseLevel, Instructor } from '@/types/learning';

export type SortOption = 'popular' | 'rating' | 'newest' | 'duration' | 'title';

export type DurationFilter = 'all' | 'under-2h' | '2-5h' | '5h-plus';

export interface CatalogFiltersState {
  search: string;
  categories: string[];
  levels: CourseLevel[];
  duration: DurationFilter;
  sort: SortOption;
  page: number;
}

export interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Filters a list of courses based on search query, categories, levels, and duration.
 */
export function filterCourses(
  courses: Course[],
  instructors: Instructor[],
  filters: {
    search?: string;
    categories?: string[];
    levels?: CourseLevel[];
    duration?: DurationFilter;
  }
): Course[] {
  const instructorMap = new Map(instructors.map((i) => [i.id, i.name.toLowerCase()]));
  const query = filters.search?.trim().toLowerCase() || '';
  const selectedCategories = filters.categories || [];
  const selectedLevels = filters.levels || [];
  const durationFilter = filters.duration || 'all';

  return courses.filter((course) => {
    // 1. Search filter: title, tags, instructor name, description
    if (query) {
      const matchTitle = course.title.toLowerCase().includes(query);
      const matchDesc = course.description.toLowerCase().includes(query);
      const matchTags = course.tags.some((tag) => tag.toLowerCase().includes(query));
      const instructorName = instructorMap.get(course.instructorId) || '';
      const matchInstructor = instructorName.includes(query);

      if (!matchTitle && !matchDesc && !matchTags && !matchInstructor) {
        return false;
      }
    }

    // 2. Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(course.category)) {
      return false;
    }

    // 3. Level filter
    if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) {
      return false;
    }

    // 4. Duration filter
    if (durationFilter === 'under-2h' && course.durationMinutes >= 120) {
      return false;
    }
    if (
      durationFilter === '2-5h' &&
      (course.durationMinutes < 120 || course.durationMinutes > 300)
    ) {
      return false;
    }
    if (durationFilter === '5h-plus' && course.durationMinutes <= 300) {
      return false;
    }

    return true;
  });
}

/**
 * Sorts courses by popularity, rating, creation date, duration, or alphabetical title.
 */
export function sortCourses(courses: Course[], sortBy: SortOption): Course[] {
  const list = [...courses];

  switch (sortBy) {
    case 'popular':
      return list.sort((a, b) => b.popularity - a.popularity || b.ratingsCount - a.ratingsCount);

    case 'rating':
      return list.sort((a, b) => b.rating - a.rating || b.ratingsCount - a.ratingsCount);

    case 'newest':
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case 'duration':
      return list.sort((a, b) => a.durationMinutes - b.durationMinutes);

    case 'title':
      return list.sort((a, b) => a.title.localeCompare(b.title));

    default:
      return list;
  }
}

/**
 * Paginates an array of items.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize = 9
): PaginationResult<T> {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalCount);
  const pagedItems = totalCount === 0 ? [] : items.slice(startIdx, endIdx);

  return {
    items: pagedItems,
    totalPages,
    currentPage,
    totalCount,
    startIndex: totalCount === 0 ? 0 : startIdx + 1,
    endIndex: endIdx,
  };
}

