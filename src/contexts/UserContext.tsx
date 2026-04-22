'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  travel_style?: string
  phone?: string
  nationality?: string
  passport_number?: string
  preferred_destinations?: string[]
  avatar_url?: string
  onboarding_completed?: boolean
  user_role?: string
  onboarding_step?: number
  verification_status?: string
  rekognition_id?: string
  password?: string
  created_at?: string
  updated_at?: string
}

export interface UserPreferences {
  id: string
  user_id: string
  preferred_language: 'en' | 'ms'
  preferred_currency: string
  travel_style: 'budget' | 'mid' | 'luxury' | 'ultra-luxury'
  email_notifications: boolean
  sms_notifications: boolean
}

interface UserContextType {
  user: UserProfile | null
  preferences: UserPreferences | null
  loading: boolean
  initialLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithUser: (user: UserProfile) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<{ success: boolean; error?: string }>
  isAuthenticated: boolean
  getUserDisplayName: () => string
  getUserGreeting: () => string
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Demo travel users
  const mockUsers: Record<string, UserProfile> = {
    'sarah.chen@zentravel.com': {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'sarah.chen@zentravel.com',
      full_name: 'Sarah Chen',
      travel_style: 'adventure',
      phone: '+60123456789',
      nationality: 'Malaysian',
      preferred_destinations: ['Japan', 'Iceland', 'Patagonia'],
      onboarding_completed: true,
      user_role: 'traveler',
      onboarding_step: 4,
      verification_status: 'verified',
      rekognition_id: 'aws-rekognition-face-sarah-001',
      password: 'password123',
    },
    'marcus.rivera@zentravel.com': {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'marcus.rivera@zentravel.com',
      full_name: 'Marcus Rivera',
      travel_style: 'luxury',
      phone: '+60198765432',
      nationality: 'Singaporean',
      preferred_destinations: ['Maldives', 'Santorini', 'Bali'],
      onboarding_completed: true,
      user_role: 'traveler',
      onboarding_step: 4,
      verification_status: 'verified',
      rekognition_id: 'aws-rekognition-face-marcus-002',
      password: 'password123',
    },
    'aiko.tanaka@zentravel.com': {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'aiko.tanaka@zentravel.com',
      full_name: 'Aiko Tanaka',
      travel_style: 'cultural',
      phone: '+60176543210',
      nationality: 'Japanese',
      preferred_destinations: ['Italy', 'Morocco', 'Peru'],
      onboarding_completed: true,
      user_role: 'traveler',
      onboarding_step: 4,
      verification_status: 'verified',
      rekognition_id: 'aws-rekognition-face-aiko-003',
      password: 'password123',
    },
  }

  const mockPreferences: Record<string, UserPreferences> = {
    'sarah.chen@zentravel.com': {
      id: 'pref-111',
      user_id: '11111111-1111-1111-1111-111111111111',
      preferred_language: 'en',
      preferred_currency: 'USD',
      travel_style: 'mid',
      email_notifications: true,
      sms_notifications: false,
    },
    'marcus.rivera@zentravel.com': {
      id: 'pref-222',
      user_id: '22222222-2222-2222-2222-222222222222',
      preferred_language: 'en',
      preferred_currency: 'SGD',
      travel_style: 'luxury',
      email_notifications: true,
      sms_notifications: true,
    },
    'aiko.tanaka@zentravel.com': {
      id: 'pref-333',
      user_id: '33333333-3333-3333-3333-333333333333',
      preferred_language: 'en',
      preferred_currency: 'JPY',
      travel_style: 'mid',
      email_notifications: true,
      sms_notifications: false,
    },
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockUser = mockUsers[email]
      if (!mockUser || mockUser.password !== password) {
        return { success: false, error: 'Invalid email or password' }
      }
      setUser(mockUser)
      setPreferences(mockPreferences[email] || null)
      return { success: true }
    } catch {
      return { success: false, error: 'Login failed. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  const loginWithUser = async (userProfile: UserProfile): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    try {
      setUser(userProfile)
      if (userProfile.email && mockPreferences[userProfile.email]) {
        setPreferences(mockPreferences[userProfile.email])
      } else {
        setPreferences({
          id: `pref-${userProfile.id}`,
          user_id: userProfile.id,
          preferred_language: 'en',
          preferred_currency: 'USD',
          travel_style: 'mid',
          email_notifications: true,
          sms_notifications: false,
        })
      }
      return { success: true }
    } catch {
      return { success: false, error: 'Login failed. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setPreferences(null)
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' }
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUser((prev) => (prev ? { ...prev, ...updates } : null))
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to update profile' }
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: Partial<UserPreferences>): Promise<{ success: boolean; error?: string }> => {
    if (!user || !preferences) return { success: false, error: 'No user logged in' }
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setPreferences((prev) => (prev ? { ...prev, ...updates } : null))
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to update preferences' }
    } finally {
      setLoading(false)
    }
  }

  const isAuthenticated = !!user

  const getUserDisplayName = (): string => {
    if (!user) return 'Guest'
    return user.full_name || user.email.split('@')[0] || 'Traveler'
  }

  const getUserGreeting = (): string => {
    if (!user) return 'Welcome!'
    const name = user.full_name?.split(' ')[0] || 'Traveler'
    return `Welcome back, ${name}!`
  }

  return (
    <UserContext.Provider
      value={{
        user,
        preferences,
        loading,
        initialLoading,
        login,
        loginWithUser,
        logout,
        updateProfile,
        updatePreferences,
        isAuthenticated,
        getUserDisplayName,
        getUserGreeting,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
