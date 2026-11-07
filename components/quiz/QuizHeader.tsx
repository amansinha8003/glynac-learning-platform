'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface QuizHeaderProps {
  quizTitle: string;
  courseTitle: string;
  timeLimitSeconds?: number;
  startedAtTimestamp: number;
  onTimeUp: () => void;
  onLeaveQuiz: () => void;
}

export function QuizHeader({
  quizTitle,
  courseTitle,
  timeLimitSeconds,
  startedAtTimestamp,
  onTimeUp,
  onLeaveQuiz,
}: QuizHeaderProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    timeLimitSeconds || 0
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const announcedMilestonesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = Math.floor((now - startedAtTimestamp) / 1000);

      if (timeLimitSeconds) {
        const remaining = Math.max(0, timeLimitSeconds - deltaSec);
        setSecondsRemaining(remaining);

        // Screen reader announcement only at 60s, 30s, 10s
        if ([60, 30, 10].includes(remaining) && !announcedMilestonesRef.current.has(remaining)) {
          announcedMilestonesRef.current.add(remaining);
          setAriaAnnouncement(`${remaining} seconds remaining`);
        }

        if (remaining <= 0) {
          clearInterval(interval);
          onTimeUp();
        }
      } else {
        setElapsedSeconds(deltaSec);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [timeLimitSeconds, startedAtTimestamp, onTimeUp]);

  // Format mm:ss
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLimitSeconds && secondsRemaining <= 60 && secondsRemaining > 20;
  const isDanger = timeLimitSeconds && secondsRemaining <= 20;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
      {/* Quiz & Course Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          {courseTitle}
        </span>
        <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight leading-snug">
          {quizTitle}
        </h1>
      </div>

      {/* Right Controls: Timer & Leave */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Timer Badge */}
        <div
          role="timer"
          aria-label={timeLimitSeconds ? 'Quiz countdown timer' : 'Quiz elapsed timer'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold transition-colors ${
            isDanger
              ? 'border-destructive bg-destructive/15 text-destructive animate-pulse'
              : isWarning
              ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : 'border-border bg-card text-foreground'
          }`}
        >
          {isDanger ? (
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-primary" />
          )}
          <span>{formatTime(timeLimitSeconds ? secondsRemaining : elapsedSeconds)}</span>
        </div>

        {/* Aria Live Announcement Region */}
        <div className="sr-only" aria-live="assertive">
          {ariaAnnouncement}
        </div>

        {/* Leave Quiz Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsLeaveDialogOpen(true)}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive gap-1"
          aria-label="Leave quiz"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Leave</span>
        </Button>
      </div>

      {/* Leave Confirmation Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Abandon Quiz Attempt?</DialogTitle>
            <DialogDescription>
              Your current progress in this quiz will be cancelled and answers will not be recorded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
              Continue Quiz
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsLeaveDialogOpen(false);
                onLeaveQuiz();
              }}
            >
              Leave Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

