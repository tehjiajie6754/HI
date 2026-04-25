'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname()
  
  const isPreLoginPage = pathname === '/' || pathname === '/login' || pathname === '/register'
  const isExplorePage = pathname === '/explore'
  const isItineraryPage = pathname === '/itinerary'
  const isFooterHidden = pathname.startsWith('/onboarding') || isExplorePage || isItineraryPage
  
  if (isPreLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {!isFooterHidden && <Footer />}
    </div>
  )
}

export default ConditionalLayout
