import { TranscriptLine } from '@/types/learning';

/**
 * Finds the index of the active TranscriptLine matching the current video time
 * using binary search (O(log n)).
 */
export function getActiveLineIndex(
  lines: TranscriptLine[],
  currentTime: number
): number {
  if (!lines || lines.length === 0) return -1;

  let low = 0;
  let high = lines.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const line = lines[mid];

    if (currentTime >= line.startSec && currentTime < line.endSec) {
      return mid;
    }

    if (currentTime < line.startSec) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  // Fallback tolerance: if currentTime is between gaps, check closest previous line
  if (high >= 0 && high < lines.length) {
    const prevLine = lines[high];
    if (currentTime >= prevLine.startSec && currentTime <= prevLine.endSec + 0.5) {
      return high;
    }
  }

  return -1;
}

