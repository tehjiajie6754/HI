// Navigation Types
export interface NavItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

// Feature Types
export interface Feature {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

// Testimonial Types
export interface Testimonial {
  id: string
  name: string
  role: string
  location: string
  content: string
  avatar: string
  rating: number
  destination: string
}

// UI Component Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'lg' | 'none'
}

// Travel-specific Types
export interface Destination {
  id: string
  name: string
  country: string
  region: string
  image: string
  description: string
  bestTime: string
  priceRange: 'budget' | 'mid' | 'luxury' | 'ultra-luxury'
  tags: string[]
}

export interface TripItinerary {
  id: string
  title: string
  destination: string
  duration: number
  startDate?: string
  endDate?: string
  budget?: number
  currency: string
  status: 'draft' | 'planned' | 'confirmed' | 'completed'
  days: ItineraryDay[]
  createdAt: string
  updatedAt: string
}

export interface ItineraryDay {
  day: number
  date?: string
  activities: Activity[]
  accommodation?: string
  notes?: string
}

export interface Activity {
  id: string
  time: string
  title: string
  description: string
  duration: string
  cost?: number
  category: 'transport' | 'accommodation' | 'dining' | 'sightseeing' | 'activity' | 'shopping'
  location?: string
  bookingRequired: boolean
  bookingUrl?: string
}

export interface TravelStyle {
  id: string
  name: string
  description: string
  icon: string
}

// Multi-language Support
export interface LanguageSupport {
  code: string
  name: string
  nativeName: string
  flag: string
  isActive: boolean
}

export interface DateRange {
  from: Date
  to: Date
}
