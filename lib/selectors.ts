import {
  differenceInCalendarDays,
  format,
  parseISO,
  subDays,
} from 'date-fns';
import {
  Course,
  Lesson,
  ProgressState,
  QuizAttempt,
} from '@/types/learning';

export interface ContinueLearningResult {
  course: Course;
  lesson: Lesson;
  progressPercent: number;
}

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
  activeToday: boolean;
}

/**
 * Calculates the completion percentage (0 - 100) for a given course.
 */
export function getCourseProgressPercent(
  course: Course,
  progress: ProgressState
): number {
  const allLessons = course.sections.flatMap((s) => s.lessons);
  if (allLessons.length === 0) return 0;

  const completedCount = allLessons.filter(
    (lesson) => progress.lessons[lesson.id]?.completed
  ).length;

  return Math.round((completedCount / allLessons.length) * 100);
}

/**
 * Finds the currently active or next uncompleted lesson for the most recently accessed enrolled course.
 */
export function getContinueLearning(
  courses: Course[],
  enrolledCourseIds: string[],
  progress: ProgressState
): ContinueLearningResult | null {
  const enrolledCourses = courses.filter((c) =>
    enrolledCourseIds.includes(c.id)
  );

  if (enrolledCourses.length === 0) return null;

  for (const course of enrolledCourses) {
    const allLessons = course.sections.flatMap((s) => s.lessons);
    if (allLessons.length === 0) continue;

    const percent = getCourseProgressPercent(course, progress);
    if (percent === 100) continue;

    const lastLessonId = progress.courses[course.id]?.lastLessonId;
    let targetLesson = allLessons.find((l) => l.id === lastLessonId);

    if (!targetLesson || progress.lessons[targetLesson.id]?.completed) {
      targetLesson =
        allLessons.find((l) => !progress.lessons[l.id]?.completed) ||
        allLessons[0];
    }

    return {
      course,
      lesson: targetLesson,
      progressPercent: percent,
    };
  }

  // If all enrolled courses are 100% completed, return the first one
  const firstCourse = enrolledCourses[0];
  const firstLesson = firstCourse.sections[0]?.lessons[0];
  if (!firstLesson) return null;

  return {
    course: firstCourse,
    lesson: firstLesson,
    progressPercent: 100,
  };
}

/**
 * Computes consecutive days streak and all-time best streak.
 */
export function getStreak(streakDates: string[]): StreakResult {
  if (!streakDates || streakDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, activeToday: false };
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const uniqueSortedDates = Array.from(new Set(streakDates))
    .sort()
    .map((d) => parseISO(d));

  const activeToday = streakDates.includes(todayStr);

  // Compute best streak across historical dates
  let bestStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < uniqueSortedDates.length; i++) {
    const diff = differenceInCalendarDays(
      uniqueSortedDates[i],
      uniqueSortedDates[i - 1]
    );

    if (diff === 1) {
      runningStreak++;
      if (runningStreak > bestStreak) {
        bestStreak = runningStreak;
      }
    } else if (diff > 1) {
      runningStreak = 1;
    }
  }

  // Compute current active streak ending today or yesterday
  const hasRecentActivity =
    streakDates.includes(todayStr) || streakDates.includes(yesterdayStr);

  if (!hasRecentActivity) {
    return {
      currentStreak: 0,
      bestStreak,
      activeToday,
    };
  }

  let currentStreak = 0;
  let checkDate = activeToday ? new Date() : subDays(new Date(), 1);

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (streakDates.includes(dateStr)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    activeToday,
  };
}

/**
 * Returns the attempt with the highest score percent for a specific quiz.
 */
export function getBestAttempt(
  quizAttempts: QuizAttempt[],
  quizId: string
): QuizAttempt | undefined {
  const attempts = quizAttempts.filter((a) => a.quizId === quizId);
  if (attempts.length === 0) return undefined;

  return attempts.reduce((best, curr) =>
    curr.scorePercent > best.scorePercent ? curr : best
  );
}

/**
 * Returns all courses where all lessons are marked completed.
 */
export function getCompletedCourses(
  courses: Course[],
  progress: ProgressState
): Course[] {
  return courses.filter((course) => {
    const percent = getCourseProgressPercent(course, progress);
    return percent === 100 || !!progress.courses[course.id]?.completedAt;
  });
}

