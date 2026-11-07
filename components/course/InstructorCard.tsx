import { Instructor } from '@/types/learning';
import { Star, Users, BookOpen } from 'lucide-react';

interface InstructorCardProps {
  instructor: Instructor;
  courseCount: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function InstructorCard({ instructor, courseCount }: InstructorCardProps) {
  const initials = getInitials(instructor.name);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-border/60">
        {/* Avatar from initials on gradient */}
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-violet-700 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md shrink-0 select-none">
          {initials}
        </div>

        {/* Name and Title */}
        <div className="min-w-0 flex-1">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">
            {instructor.name}
          </h3>
          <p className="text-sm text-primary font-medium mt-0.5">
            {instructor.title}
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {instructor.rating.toFixed(2)} Instructor Rating
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {instructor.studentsCount.toLocaleString()} Students
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="pt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          About the Instructor
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {instructor.bio}
        </p>
      </div>
    </div>
  );
}

