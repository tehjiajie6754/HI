'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import PreLoginHome from '@/components/auth/PreLoginHome'

export default function Home() {
  const { isAuthenticated, initialLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!initialLoading && isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, initialLoading, router])

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <PreLoginHome />
  }

  return null
}
