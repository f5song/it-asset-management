
'use client';

import * as React from 'react';
import { cn } from '../ui';


type BaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function SecondaryButton({
  className,
  children,
  disabled,
  ...props
}: BaseButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled}
      className={cn(
        'rounded-md border border-slate-300 px-4 py-2 text-sm font-medium',
        'text-slate-700 hover:bg-slate-50 disabled:opacity-60',
        className
      )}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  className,
  children,
  disabled,
  loading,
  ...props
}: BaseButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md',
        'bg-blue-600 px-4 py-2 text-sm font-semibold text-white',
        'hover:bg-blue-700 disabled:opacity-60',
        className
      )}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="white"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="white"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
