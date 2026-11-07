'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Compass, Sparkles, Pencil, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface DashboardHeroProps {
  displayName: string;
  streakCount: number;
  continueLessonUrl: string | null;
  onUpdateDisplayName: (name: string) => void;
}

export function DashboardHero({
  displayName,
  streakCount,
  continueLessonUrl,
  onUpdateDisplayName,
}: DashboardHeroProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);

  // Time of day greeting
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateDisplayName(nameInput.trim());
    }
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white p-6 sm:p-10 shadow-lg">
        {/* Soft SVG Sparkle Shapes in Background */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-44 h-44 rounded-full bg-violet-400/20 blur-xl pointer-events-none" />

        <svg
          className="absolute top-6 right-8 w-16 h-16 text-white/15 pointer-events-none hidden sm:block"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>

        <svg
          className="absolute bottom-6 right-28 w-8 h-8 text-white/10 pointer-events-none"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>

        {/* Content */}
        <div className="relative z-10 max-w-xl space-y-4">
          {/* Streak pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
            {streakCount > 0 ? (
              <>
                <Flame className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                <span>{streakCount} day streak, keep it going!</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-violet-200" />
                <span>Ready to start your learning streak today?</span>
              </>
            )}
          </div>

          {/* Heading with edit name button */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {timeGreeting}, {displayName}!
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNameInput(displayName);
                  setIsEditDialogOpen(true);
                }}
                className="h-7 w-7 rounded-lg text-white/80 hover:text-white hover:bg-white/15"
                aria-label="Edit display name"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-violet-100/90 leading-relaxed max-w-lg">
              Track your syllabus completion, review past assessment insights, and keep your daily streak alive.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            {continueLessonUrl ? (
              <Button
                asChild
                size="lg"
                className="bg-white text-violet-700 hover:bg-violet-50 font-bold text-xs sm:text-sm rounded-xl shadow-md gap-2"
              >
                <Link href={continueLessonUrl}>
                  <Play className="h-4 w-4 fill-current" />
                  Continue Learning
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="bg-white text-violet-700 hover:bg-violet-50 font-bold text-xs sm:text-sm rounded-xl shadow-md gap-2"
              >
                <Link href="/courses">
                  <Compass className="h-4 w-4" />
                  Browse Courses
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Name Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile Name</DialogTitle>
            <DialogDescription>
              Enter the name you would like displayed across your dashboard and learning achievements.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex Rivera"
              maxLength={32}
              className="text-sm rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveName}>
              Save Name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

