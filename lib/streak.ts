import {
  format,
  subDays,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  differenceInCalendarDays,
  isSameDay,
  isSameMonth,
  parseISO,
} from 'date-fns';

export interface DayCell {
  date: Date;
  dateString: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  activityCount: number;
  isActive: boolean;
}

export interface WeeklyDayActivity {
  dayName: string;
  shortDate: string;
  dateString: string;
  count: number;
  isToday: boolean;
}

/**
 * Normalizes all active dates into a lookup set.
 */
function getActiveDateSet(
  streakDates: string[] = [],
  activityByDate: Record<string, number> = {}
): Set<string> {
  const set = new Set<string>(streakDates);
  Object.entries(activityByDate).forEach(([dateStr, count]) => {
    if (count > 0) {
      set.add(dateStr);
    }
  });
  return set;
}

/**
 * Calculates current active streak in days (using user's local date).
 * An active streak continues if the user was active today or yesterday.
 */
export function getCurrentStreak(
  streakDates: string[] = [],
  activityByDate: Record<string, number> = {}
): number {
  const activeSet = getActiveDateSet(streakDates, activityByDate);
  if (activeSet.size === 0) return 0;

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(now, 1), 'yyyy-MM-dd');

  // If neither today nor yesterday has activity, current streak is 0
  const hasToday = activeSet.has(todayStr);
  const hasYesterday = activeSet.has(yesterdayStr);

  if (!hasToday && !hasYesterday) {
    return 0;
  }

  const startDay = hasToday ? now : subDays(now, 1);
  let streak = 0;
  let checkCursor = startDay;

  while (true) {
    const formattedCursor = format(checkCursor, 'yyyy-MM-dd');
    if (activeSet.has(formattedCursor)) {
      streak += 1;
      checkCursor = subDays(checkCursor, 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates longest continuous streak achieved across all recorded activity dates.
 */
export function getLongestStreak(
  streakDates: string[] = [],
  activityByDate: Record<string, number> = {}
): number {
  const activeSet = getActiveDateSet(streakDates, activityByDate);
  if (activeSet.size === 0) return 0;

  // Sort unique dates ascending
  const sortedDates = Array.from(activeSet)
    .map((str) => parseISO(str))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (sortedDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = sortedDates[i - 1];
    const curr = sortedDates[i];
    const diffDays = differenceInCalendarDays(curr, prev);

    if (diffDays === 1) {
      currentStreak += 1;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Builds the month calendar matrix (42 cells: 6 weeks x 7 days) for the given year and month.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  activeDays: Set<string> | Record<string, number>
): DayCell[] {
  const targetDate = new Date(year, month, 1);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const isRecord = !(activeDays instanceof Set);
  const today = new Date();
  const cells: DayCell[] = [];

  let cursor = gridStart;
  while (cursor <= gridEnd || cells.length < 35) {
    const dateStr = format(cursor, 'yyyy-MM-dd');
    const activityCount = isRecord
      ? (activeDays as Record<string, number>)[dateStr] || 0
      : (activeDays as Set<string>).has(dateStr)
      ? 1
      : 0;

    cells.push({
      date: new Date(cursor),
      dateString: dateStr,
      dayOfMonth: cursor.getDate(),
      isCurrentMonth: isSameMonth(cursor, targetDate),
      isToday: isSameDay(cursor, today),
      activityCount,
      isActive: activityCount > 0,
    });

    cursor = addDays(cursor, 1);
    // Standard calendar grid cap at 42 days (6 weeks)
    if (cells.length >= 42) break;
  }

  return cells;
}

/**
 * Returns activity stats for the last 7 days (6 days ago through today).
 */
export function getWeeklyActivity(
  activityByDate: Record<string, number> = {},
  streakDates: string[] = []
): WeeklyDayActivity[] {
  const activeSet = getActiveDateSet(streakDates, activityByDate);
  const now = new Date();
  const days: WeeklyDayActivity[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = subDays(now, i);
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayName = format(day, 'EEE');
    const shortDate = format(day, 'MMM d');
    const count = activityByDate[dateStr] || (activeSet.has(dateStr) ? 1 : 0);
    const isToday = i === 0;

    days.push({
      dayName,
      shortDate,
      dateString: dateStr,
      count,
      isToday,
    });
  }

  return days;
}

