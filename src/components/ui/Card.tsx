import { cn } from '@/lib/utils'
import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  const paddingMap = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }
  return (
    <div
      className={cn(
        'bg-[var(--color-white)] border border-[var(--color-stone)] rounded-2xl shadow-[var(--shadow-md)]',
        hover && 'transition-all duration-300 hover:shadow-[var(--shadow-lg)] hover:-translate-y-1',
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={cn('font-heading text-xl font-semibold text-[var(--color-charcoal)]', className)}
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-[var(--color-text-secondary)] text-sm mt-1', className)}>{children}</p>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-6 pt-4 border-t border-[var(--color-stone)] flex items-center gap-3', className)}>{children}</div>
}
