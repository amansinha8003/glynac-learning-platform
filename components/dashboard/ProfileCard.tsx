'use client';

import { ProgressRing } from './ProgressRing';
import { UserCheck } from 'lucide-react';

interface ProfileCardProps {
  displayName: string;
  overallProgressPercent: number;
  enrolledCount: number;
  completedCount: number;
}

export function ProfileCard({
  displayName,
  overallProgressPercent,
  enrolledCount,
  completedCount,
}: ProfileCardProps) {
  // Generate 1-2 letter initials
  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'L';

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
      {/* Progress ring wrapping initials avatar */}
      <div className="relative shrink-0 flex items-center justify-center">
        <ProgressRing
          value={overallProgressPercent}
          size={72}
          stroke={6}
          showValueText={false}
          label="Overall Learning Progress"
        />
        <div className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-violet-400 flex items-center justify-center text-white font-bold text-sm shadow-xs select-none">
          {initials}
        </div>
      </div>

      {/* Profile Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-extrabold text-sm text-foreground truncate">
            {displayName}
          </h3>
          <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {enrolledCount} {enrolledCount === 1 ? 'course' : 'courses'} enrolled
        </p>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-primary mt-1">
          <span className="tabular-nums">{overallProgressPercent}% complete</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground tabular-nums">
            {completedCount} finished
          </span>
        </div>
      </div>
    </div>
  );
}

