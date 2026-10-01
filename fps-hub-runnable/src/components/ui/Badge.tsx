import { cn } from '@/lib/cn';

const colors: Record<string, string> = {
  GENERAL: 'bg-[hsl(var(--bg-subtle))] text-[hsl(var(--fg-muted))]',
  ACHIEVEMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROJECT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  EVENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  QUESTION: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ANNOUNCEMENT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PENDING: 'bg-yellow-100 text-yellow-800',
  VERIFIED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  ADMIN: 'bg-red-100 text-red-800',
  TEACHER: 'bg-blue-100 text-blue-800',
  STUDENT: 'bg-[hsl(var(--bg-subtle))] text-[hsl(var(--fg-muted))]',
};

interface BadgeProps {
  label: string;
  variant?: string;
  className?: string;
}

export function Badge({ label, variant, className }: BadgeProps) {
  const colorClass = variant ? (colors[variant] ?? colors.GENERAL) : colors.GENERAL;
  return (
    <span className={cn('badge', colorClass, className)}>
      {label}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin w-5 h-5 text-[hsl(var(--brand))]', className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
