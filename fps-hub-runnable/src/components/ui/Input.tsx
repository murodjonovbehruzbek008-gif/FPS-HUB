'use client';

import { cn } from '@/lib/cn';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-2.5 rounded-[var(--radius-sm)] border border-[hsl(var(--border))]',
        'bg-[hsl(var(--bg-card))] text-[hsl(var(--fg))] text-sm',
        'placeholder:text-[hsl(var(--fg-subtle))]',
        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-shadow duration-150',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3 py-2.5 rounded-[var(--radius-sm)] border border-[hsl(var(--border))]',
        'bg-[hsl(var(--bg-card))] text-[hsl(var(--fg))] text-sm resize-none',
        'placeholder:text-[hsl(var(--fg-subtle))]',
        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-shadow duration-150',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
