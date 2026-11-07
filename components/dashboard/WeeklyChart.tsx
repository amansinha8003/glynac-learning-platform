'use client';

import { useState } from 'react';
import { getWeeklyActivity, WeeklyDayActivity } from '@/lib/streak';
import { BarChart2 } from 'lucide-react';

interface WeeklyChartProps {
  activityByDate: Record<string, number>;
  streakDates: string[];
}

export function WeeklyChart({ activityByDate, streakDates }: WeeklyChartProps) {
  const [hoveredDay, setHoveredDay] = useState<WeeklyDayActivity | null>(null);

  const days = getWeeklyActivity(activityByDate, streakDates);
  const maxActivity = Math.max(...days.map((d) => d.count), 4);

  const chartHeight = 90;
  const chartWidth = 280;
  const barWidth = 24;
  const gap = (chartWidth - barWidth * 7) / 6;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
      {/* Title & Active Hover Tooltip */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Weekly Activity</h3>
            <p className="text-[10px] text-muted-foreground">Last 7 days of learning</p>
          </div>
        </div>

        {/* Hover / Active Indicator */}
        <div className="text-right">
          <span className="text-xs font-bold text-primary font-mono tabular-nums">
            {hoveredDay ? `${hoveredDay.count} activities` : `${days.reduce((acc, d) => acc + d.count, 0)} total`}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            {hoveredDay ? hoveredDay.shortDate : 'This week'}
          </span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="w-full flex justify-center py-1">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`}
          className="w-full max-w-[280px] h-32 overflow-visible select-none"
          role="img"
          aria-label="Weekly activity bar chart"
        >
          {days.map((day, idx) => {
            const x = idx * (barWidth + gap);
            const barHeight = Math.max(6, (day.count / maxActivity) * chartHeight);
            const y = chartHeight - barHeight;
            const isHovered = hoveredDay?.dateString === day.dateString;

            return (
              <g
                key={day.dateString}
                className="cursor-pointer focus:outline-hidden"
                tabIndex={0}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                onFocus={() => setHoveredDay(day)}
                onBlur={() => setHoveredDay(null)}
              >
                {/* Background Track Bar */}
                <rect
                  x={x}
                  y={0}
                  width={barWidth}
                  height={chartHeight}
                  rx={6}
                  className="fill-muted/40"
                />

                {/* Activity Fill Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  className={`transition-all duration-200 ${
                    day.isToday
                      ? 'fill-primary'
                      : isHovered
                      ? 'fill-primary'
                      : 'fill-primary/60'
                  }`}
                />

                {/* Day Label Text */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-semibold transition-colors ${
                    day.isToday
                      ? 'fill-primary font-bold'
                      : isHovered
                      ? 'fill-foreground'
                      : 'fill-muted-foreground'
                  }`}
                >
                  {day.dayName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Accessible Table Fallback for Screen Readers */}
      <table className="sr-only">
        <caption>Weekly Activity Breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Date</th>
            <th scope="col">Activity Count</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.dateString}>
              <td>{day.dayName}</td>
              <td>{day.shortDate}</td>
              <td>{day.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

