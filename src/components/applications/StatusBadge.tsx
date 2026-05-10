import { ApplicationStatus, STATUS_COLOURS } from '@/types/database';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap',
        STATUS_COLOURS[status],
        className
      )}
    >
      {status}
    </span>
  );
}
