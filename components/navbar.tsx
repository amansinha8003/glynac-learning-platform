'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, GraduationCap, Moon, Sun, Flame } from 'lucide-react';
import { useLearningStore } from '@/store/learningStore';
import { getStreak } from '@/lib/selectors';
import { useHydrated } from '@/lib/useHydrated';

export function Navbar() {
  const pathname = usePathname();
  const isHydrated = useHydrated();
  const streakDates = useLearningStore((s) => s.streakDates);
  const hasStoreHydrated = useLearningStore((s) => s.hasHydrated);

  const isReady = isHydrated && hasStoreHydrated;
  const streak = isReady
    ? getStreak(streakDates)
    : { currentStreak: 0, bestStreak: 0, activeToday: false };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/courses" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none text-foreground">
                Glynac<span className="text-primary">Learn</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                Academy
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/courses"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname?.startsWith('/courses')
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Link>
            <Link
              href="/my-learning"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname?.startsWith('/my-learning')
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              My Learning
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          {isReady && streak.currentStreak > 0 && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                streak.activeToday
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
              title={`${streak.currentStreak} day learning streak!`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{streak.currentStreak}d</span>
            </div>
          )}

          {/* Theme Toggle Placeholder */}
          <button
            type="button"
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </div>
    </header>
  );
}
