'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, GraduationCap, Award } from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Learning',
    href: '/dashboard',
    icon: GraduationCap,
  },
  {
    title: 'Courses',
    href: '/courses',
    icon: BookOpen,
  },
  {
    title: 'Certificates',
    href: '/certificates',
    icon: Award,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar (>= 1280px / xl) */}
      <aside className="hidden xl:block w-[220px] shrink-0" aria-label="Dashboard sidebar navigation">
        <div className="sticky top-20 rounded-2xl border border-border bg-card p-3 shadow-xs space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Navigation
          </div>

          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard' && idx === 0
                  : pathname === item.href;

              return (
                <Link
                  key={`${item.title}-${idx}`}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-soft text-primary shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile & Tablet Top Navigation Strip */}
      <div className="xl:hidden w-full overflow-x-auto pb-1" aria-label="Dashboard mobile navigation">
        <nav className="flex items-center gap-2 p-1.5 rounded-2xl border border-border bg-card shadow-xs min-w-max">
          {SIDEBAR_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard' && idx === 0
                : pathname === item.href;

            return (
              <Link
                key={`mobile-${item.title}-${idx}`}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary-soft text-primary shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

