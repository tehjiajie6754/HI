import { cn } from '@/lib/utils'
import React from 'react'

type BadgeVariant = 'gold' | 'charcoal' | 'stone' | 'green' | 'red'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30',
  charcoal: 'bg-[var(--color-charcoal)] text-white border border-transparent',
  stone: 'bg-[var(--color-stone)] text-[var(--color-text-secondary)] border border-[var(--color-stone)]',
  green: 'bg-green-50 text-green-700 border border-green-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export function Badge({ children, variant = 'stone', size = 'sm', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          variant === 'gold' ? 'bg-[var(--color-gold)]' :
          variant === 'green' ? 'bg-green-500' :
          variant === 'red' ? 'bg-red-500' :
          'bg-current opacity-60'
        )} />
      )}
      {children}
    </span>
  )
}
