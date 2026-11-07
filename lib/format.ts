import { format, formatDistanceToNow } from 'date-fns';

/**
 * Formats duration in minutes into a human-readable string like "4h 20m" or "45m".
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMinutes}m`;
}

/**
 * Formats seconds into mm:ss or hh:mm:ss.
 */
export function formatSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats a score percentage (e.g. 85 -> "85%").
 */
export function formatScorePercent(score: number): string {
  return `${Math.round(score)}%`;
}

/**
 * Formats a date into a standard short display string (e.g. "Mar 15, 2026").
 */
export function formatShortDate(date: string | Date | number): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return format(d, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

/**
 * Formats a date relative to now (e.g. "2 days ago").
 */
export function formatRelativeDate(date: string | Date | number): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
}

