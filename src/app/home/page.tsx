'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import HeroSection from '@/components/sections/HeroSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import CTASection from '@/components/sections/CTASection'
import Chatbot from '@/components/chatbot/Chatbot'

export default function HomePage() {
  const { isAuthenticated, initialLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!initialLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, initialLoading, router])

  if (initialLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)] text-sm">Loading your journey...</p>
        </div>
      </div>
    )
  }

  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Chatbot />
    </main>
  )
}
