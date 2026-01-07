// src/components/badges/StatusBadge.tsx
import { cn } from '../ui';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variantClasses: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-700 ring-green-200',
  warning: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  error: 'bg-red-100 text-red-700 ring-red-200',
  info: 'bg-blue-100 text-blue-700 ring-blue-200',
  neutral: 'bg-gray-100 text-gray-700 ring-gray-200',
};

export function StatusBadge({
  label,
  variant = 'neutral',
  className,
}: {
  label: string;
  variant?: StatusVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
