'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { BookOpen, GraduationCap, Moon, Sun, Flame, Laptop, Award } from 'lucide-react';
import { useLearningStore } from '@/store/learningStore';
import { getStreak } from '@/lib/selectors';
import { useHydrated } from '@/lib/useHydrated';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const isHydrated = useHydrated();
  const { setTheme, resolvedTheme } = useTheme();

  const streakDates = useLearningStore((s) => s.streakDates);
  const hasStoreHydrated = useLearningStore((s) => s.hasHydrated);

  const isReady = isHydrated && hasStoreHydrated;
  const streak = isReady
    ? getStreak(streakDates)
    : { currentStreak: 0, bestStreak: 0, activeToday: false };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
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
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
            <Link
              href="/dashboard"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === '/dashboard' || pathname === '/my-learning'
                  ? 'bg-primary-soft text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              My Learning
            </Link>

            <Link
              href="/courses"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname?.startsWith('/courses')
                  ? 'bg-primary-soft text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Link>

            <Link
              href="/certificates"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === '/certificates'
                  ? 'bg-primary-soft text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Award className="h-4 w-4" />
              Certificates
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          {isReady && streak.currentStreak > 0 && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                streak.activeToday
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
              title={`${streak.currentStreak} day learning streak!`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span className="tabular-nums">{streak.currentStreak}d streak</span>
            </div>
          )}

          {/* Theme Dropdown Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60"
                aria-label="Select color theme"
              >
                {isHydrated && resolvedTheme === 'dark' ? (
                  <Moon className="h-4 w-4 text-primary" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-xl">
              <DropdownMenuItem
                onClick={() => setTheme('light')}
                className="gap-2 text-xs font-medium cursor-pointer"
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme('dark')}
                className="gap-2 text-xs font-medium cursor-pointer"
              >
                <Moon className="h-3.5 w-3.5 text-primary" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme('system')}
                className="gap-2 text-xs font-medium cursor-pointer"
              >
                <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
