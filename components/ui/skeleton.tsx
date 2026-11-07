import { cn } from 'cn';

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted/70 animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

