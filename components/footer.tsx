import Link from 'next/link';
import { GraduationCap, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/60 backdrop-blur-xs py-8 px-4 sm:px-6 lg:px-8 no-print mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold text-foreground">
            Glynac<span className="text-primary">Learn</span>
          </span>
          <span>&copy; 2026 • Educational Platform</span>
        </div>

        <nav aria-label="Footer navigation" className="flex items-center gap-4">
          <Link href="/courses" className="hover:text-foreground transition-colors">
            Courses
          </Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/certificates" className="hover:text-foreground transition-colors">
            Certificates
          </Link>
        </nav>

        <div className="flex items-center gap-1 text-[11px]">
          <span>Crafted with</span>
          <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          <span>for modern web engineering</span>
        </div>
      </div>
    </footer>
  );
}
