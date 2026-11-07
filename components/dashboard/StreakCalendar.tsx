'use client';

import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import {
  getCurrentStreak,
  getLongestStreak,
  buildMonthGrid,
  DayCell,
} from '@/lib/streak';
import { Flame, Trophy, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StreakCalendarProps {
  streakDates: string[];
  activityByDate: Record<string, number>;
}

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function StreakCalendar({ streakDates, activityByDate }: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const currentStreak = getCurrentStreak(streakDates, activityByDate);
  const longestStreak = getLongestStreak(streakDates, activityByDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days: DayCell[] = buildMonthGrid(year, month, activityByDate);

  const handlePrevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentDate((d) => addMonths(d, 1));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
      {/* Header with Streak Counters */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Flame className="h-4 w-4 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">
              {currentStreak} Day Streak
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-500" />
              Best: {longestStreak} days
            </div>
          </div>
        </div>

        {/* Current status pill */}
        <Badge
          variant="outline"
          className={`text-[10px] px-2 py-0.5 ${
            currentStreak > 0
              ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'text-muted-foreground'
          }`}
        >
          {currentStreak > 0 ? 'Streak Active' : 'Start Today'}
        </Badge>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <CalendarIcon className="h-3.5 w-3.5 text-primary" />
          {format(currentDate, 'MMMM yyyy')}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="h-7 w-7 rounded-lg hover:bg-muted"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-7 w-7 rounded-lg hover:bg-muted"
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="space-y-1.5">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_NAMES.map((name) => (
            <span key={name} className="text-[10px] font-semibold text-muted-foreground">
              {name}
            </span>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((cell) => {
            const hasActivity = cell.isActive;
            const isToday = cell.isToday;

            // Determine background based on activity count
            let bgClass = 'hover:bg-muted/50 text-foreground';
            if (hasActivity) {
              if (cell.activityCount > 2) {
                bgClass = 'bg-primary text-primary-foreground font-bold';
              } else {
                bgClass = 'bg-primary/80 text-primary-foreground font-semibold';
              }
            } else if (!cell.isCurrentMonth) {
              bgClass = 'text-muted-foreground/30';
            }

            return (
              <div
                key={cell.dateString}
                title={`${cell.dateString}: ${
                  cell.activityCount > 0 ? `${cell.activityCount} actions` : 'No activity'
                }`}
                className={`h-7 rounded-lg flex items-center justify-center text-[11px] transition-colors relative cursor-default ${bgClass} ${
                  isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-card font-extrabold' : ''
                }`}
              >
                <span>{cell.dayOfMonth}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

